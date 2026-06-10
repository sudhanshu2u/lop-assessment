import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "super_admin") redirect("/dashboard");

  const [userCount, questionCount, auditCount, versionCount] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.question.count({ where: { isActive: true } }),
    prisma.auditLog.count(),
    prisma.assessmentVersion.count(),
  ]);

  const recentAudit = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-500 mt-1">Super admin control panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Users", value: userCount, icon: "👤" },
          { label: "Active Questions", value: questionCount, icon: "❓" },
          { label: "Assessment Versions", value: versionCount, icon: "📋" },
          { label: "Audit Log Entries", value: auditCount, icon: "🔍" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{icon} {label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: "/dashboard/admin/users", label: "User Management", desc: "Manage roles, create users, deactivate accounts", icon: "👥" },
          { href: "/dashboard/admin/questions", label: "Question Bank", desc: "View, edit, and deactivate assessment questions", icon: "❓" },
          { href: "/api/export/excel", label: "Export All Data", desc: "Download complete XLSX with all results and scores", icon: "📊", external: true },
        ].map(({ href, label, desc, icon, external }) => (
          <Link
            key={href}
            href={href}
            target={external ? "_blank" : undefined}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-semibold text-gray-900 text-sm">{label}</div>
            <div className="text-xs text-gray-500 mt-1">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent audit log */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Recent Audit Activity</h2>
        <div className="divide-y divide-gray-50">
          {recentAudit.map((entry) => (
            <div key={entry.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                  {entry.action}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  by {entry.user?.name ?? "System"} on {entry.resourceType}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {entry.createdAt.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
