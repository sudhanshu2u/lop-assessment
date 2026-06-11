import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import { Resend } from "resend";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

function otp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function GET() {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ departments });
}

async function sendOtp(email: string, name: string, otp: string) {
  if (!process.env.resend_lop_key) {
    console.log(`[OTP] ${email} → ${otp}`);
    return null;
  }
  const resend = new Resend(process.env.resend_lop_key);
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Your LOP Assessment verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="background:#4f46e5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <h1 style="color:#fff;font-size:20px;margin:0">Leadership Operating Profile</h1>
        </div>
        <p style="color:#374151;font-size:15px">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151;font-size:15px">Your verification code for the LOP Assessment is:</p>
        <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:40px;font-weight:700;letter-spacing:8px;color:#4f46e5">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
  return error ?? null;
}

export async function POST(req: Request) {
  const { name, email, departmentId, grade, mode } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Login mode — user must already exist
  if (mode === "login") {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!existing) {
      return NextResponse.json({ error: "No account found with this email. Please sign up first." }, { status: 404 });
    }
    const otp = otp6();
    const token = await new SignJWT({ email: normalizedEmail, name: existing.name, mode: "login", otp })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(secret);
    const err = await sendOtp(normalizedEmail, existing.name, otp);
    if (err) {
      console.error(`[OTP EMAIL ERROR] ${normalizedEmail}:`, JSON.stringify(err));
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, step: "verify", token });
  }

  // Sign-up mode
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const otp = otp6();
  const token = await new SignJWT({ email: normalizedEmail, name: name.trim(), departmentId, grade, otp })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(secret);
  const err = await sendOtp(normalizedEmail, name.trim(), otp);
  if (err) {
    console.error(`[OTP EMAIL ERROR] ${normalizedEmail}:`, JSON.stringify(err));
    return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, step: "verify", token });
}
