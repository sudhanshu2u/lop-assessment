"use client";

import { useState, useEffect } from "react";

interface Employee { id: string; name: string; email: string; grade: string; department: { name: string } | null; }
interface Survey { id: string; title: string; version: string; isActive: boolean; _count: { assignments: number }; createdBy: { name: string }; createdAt: string; }

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/surveys").then((r) => r.json()).then((d) => setSurveys(d.data ?? []));
    fetch("/api/employees").then((r) => r.json()).then((d) => setEmployees(d.data ?? []));
  }, []);

  async function handleCreate() {
    if (!selectedIds.length) return;
    setCreating(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Leadership Operating Profile Assessment",
          userIds: selectedIds,
          dueDate: dueDate || null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(`✓ Assigned to ${data.created} employees`);
        setShowCreate(false);
        setSelectedIds([]);
        fetch("/api/surveys").then((r) => r.json()).then((d) => setSurveys(d.data ?? []));
      }
    } finally {
      setCreating(false);
    }
  }

  function toggleEmployee(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-500 mt-1">Manage and assign assessments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Assign Assessment
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          {message}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Assessment</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full"
              />
            </div>

            <div className="mb-4 flex-1 overflow-y-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employees ({selectedIds.length} selected)
              </label>
              <div className="space-y-1">
                {employees.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.email} · {emp.department?.name ?? "—"}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setShowCreate(false); setSelectedIds([]); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedIds.length || creating}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? "Assigning…" : `Assign to ${selectedIds.length} employees`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {surveys.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No surveys created yet.</div>
        ) : (
          surveys.map((s) => (
            <div key={s.id} className="p-5 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{s.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  v{s.version} · Created by {s.createdBy.name} ·{" "}
                  {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{s._count.assignments}</span> assigned
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
