import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function UsersAdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "super_admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: { department: { select: { name: true } } },
  });

  const ROLE_COLORS: Record<string, string> = {
    super_admin: "bg-red-100 text-red-700",
    hr_admin: "bg-purple-100 text-purple-700",
    manager: "bg-indigo-100 text-indigo-700",
    employee: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">{users.length} total users</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Role", "Department", "Grade", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className={`hover:bg-gray-50 ${!u.isActive ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.department?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{u.grade ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
