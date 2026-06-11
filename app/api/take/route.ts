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

export async function POST(req: Request) {
  const { name, email, departmentId, grade } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otp = otp6();

  // Sign OTP + form data into a short-lived JWT (10 min)
  const token = await new SignJWT({ email: normalizedEmail, name: name.trim(), departmentId, grade, otp })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(secret);

  // Send OTP email
  if (!process.env.RESEND_API_KEY) {
    // Dev fallback: log OTP to console if no email key configured
    console.log(`[OTP] ${normalizedEmail} → ${otp}`);
  } else {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "LOP Assessment <noreply@lop-assessment.vercel.app>",
      to: normalizedEmail,
      subject: "Your LOP Assessment verification code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <div style="background:#4f46e5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <h1 style="color:#fff;font-size:20px;margin:0">Leadership Operating Profile</h1>
          </div>
          <p style="color:#374151;font-size:15px">Hi <strong>${name.trim()}</strong>,</p>
          <p style="color:#374151;font-size:15px">Your verification code for the LOP Assessment is:</p>
          <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <span style="font-size:40px;font-weight:700;letter-spacing:8px;color:#4f46e5">${otp}</span>
          </div>
          <p style="color:#6b7280;font-size:13px">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true, step: "verify", token });
}
