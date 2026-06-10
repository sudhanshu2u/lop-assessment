"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  grade: string;
  location: string;
  department: { name: string } | null;
  manager: { name: string } | null;
  _count: { assignments: number };
}

interface Department { id: string; name: string; }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", grade: "", departmentId: "", employeeRole: "employee" });
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/employees").then((r) => r.json()).then((d) => setEmployees(d.data ?? []));
    fetch("/api/departments").then((r) => r.json()).then((d) => setDepartments(d.data ?? []));
  }, []);

  async function handleAdd() {
    if (!form.name || !form.email || !form.password) return;
    setAdding(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage("✓ Employee added");
        setShowAdd(false);
        setForm({ name: "", email: "", password: "", grade: "", departmentId: "", employeeRole: "employee" });
        fetch("/api/employees").then((r) => r.json()).then((d) => setEmployees(d.data ?? []));
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } finally {
      setAdding(false);
    }
  }

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(filter.toLowerCase()) ||
      e.email.toLowerCase().includes(filter.toLowerCase()) ||
      (e.department?.name ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 mt-1">{employees.length} active employees</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Employee
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      )}

      {/* Search */}
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by name, email, department…"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Department", "Grade", "Role", "Assessments", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{emp.name}</div>
                  <div className="text-xs text-gray-500">{emp.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{emp.department?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{emp.grade ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    emp.role === "manager" ? "bg-indigo-100 text-indigo-700" :
                    emp.role === "hr_admin" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {emp.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{emp._count.assignments}</td>
                <td className="px-4 py-3">
                  <button className="text-xs text-indigo-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Employee</h2>
            <div className="space-y-3">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Password", key: "password", type: "password" },
                { label: "Grade (optional)", key: "grade", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.employeeRole}
                  onChange={(e) => setForm({ ...form, employeeRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr_admin">HR Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {adding ? "Adding…" : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
