import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { QUESTIONS } from "../lib/scoring/dimensions";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: "dept-technology" },
      update: {},
      create: { id: "dept-technology", name: "Technology", function: "Engineering", location: "Mumbai" },
    }),
    prisma.department.upsert({
      where: { id: "dept-sales" },
      update: {},
      create: { id: "dept-sales", name: "Sales", function: "Revenue", location: "Delhi" },
    }),
    prisma.department.upsert({
      where: { id: "dept-hr" },
      update: {},
      create: { id: "dept-hr", name: "Human Resources", function: "People", location: "Bangalore" },
    }),
  ]);
  console.log(`✓ ${departments.length} departments`);

  // Super Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@lop.internal";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@2024!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: "System Administrator",
      role: "super_admin",
      departmentId: departments[2].id,
    },
  });
  console.log(`✓ Super admin: ${admin.email}`);

  // HR Admin
  const hrHash = await bcrypt.hash("HRAdmin@2024!", 12);
  const hrAdmin = await prisma.user.upsert({
    where: { email: "hr@lop.internal" },
    update: {},
    create: {
      email: "hr@lop.internal",
      passwordHash: hrHash,
      name: "HR Administrator",
      role: "hr_admin",
      departmentId: departments[2].id,
    },
  });
  console.log(`✓ HR admin: ${hrAdmin.email}`);

  // Manager
  const mgrHash = await bcrypt.hash("Manager@2024!", 12);
  const manager = await prisma.user.upsert({
    where: { email: "manager@lop.internal" },
    update: {},
    create: {
      email: "manager@lop.internal",
      passwordHash: mgrHash,
      name: "Tech Manager",
      role: "manager",
      departmentId: departments[0].id,
      grade: "L5",
    },
  });
  console.log(`✓ Manager: ${manager.email}`);

  // Sample employees
  const empHash = await bcrypt.hash("Employee@2024!", 12);
  const employees = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@lop.internal" },
      update: {},
      create: {
        email: "alice@lop.internal",
        passwordHash: empHash,
        name: "Alice Sharma",
        role: "employee",
        departmentId: departments[0].id,
        managerId: manager.id,
        grade: "L3",
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@lop.internal" },
      update: {},
      create: {
        email: "bob@lop.internal",
        passwordHash: empHash,
        name: "Bob Mehta",
        role: "employee",
        departmentId: departments[0].id,
        managerId: manager.id,
        grade: "L4",
      },
    }),
  ]);
  console.log(`✓ ${employees.length} sample employees`);

  // Assessment version with 40 questions
  const version = await prisma.assessmentVersion.upsert({
    where: { id: "version-1-0" },
    update: {},
    create: {
      id: "version-1-0",
      title: "Leadership Operating Profile Assessment",
      version: "1.0",
      isActive: true,
      createdById: admin.id,
    },
  });
  console.log(`✓ Assessment version: ${version.version}`);

  // Upsert all 40 questions
  let questionCount = 0;
  for (const q of QUESTIONS) {
    await prisma.question.upsert({
      where: { id: `${version.id}-${q.id}` },
      update: { text: q.text },
      create: {
        id: `${version.id}-${q.id}`,
        assessmentVersionId: version.id,
        text: q.text,
        dimension: q.dimension,
        dimensionLabel: q.dimensionLabel,
        orderIndex: q.orderIndex,
        weight: 1.0,
      },
    });
    questionCount++;
  }
  console.log(`✓ ${questionCount} questions`);

  console.log("\n✅ Seed complete!");
  console.log("   Super Admin: admin@lop.internal / Admin@2024!");
  console.log("   HR Admin:    hr@lop.internal / HRAdmin@2024!");
  console.log("   Manager:     manager@lop.internal / Manager@2024!");
  console.log("   Employee:    alice@lop.internal / Employee@2024!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
