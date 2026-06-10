"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞", roles: ["super_admin", "hr_admin", "manager", "employee"] },
  { href: "/dashboard/assessment", label: "My Assessments", icon: "📋", roles: ["employee"] },
  { href: "/dashboard/team", label: "Team Overview", icon: "👥", roles: ["super_admin", "hr_admin", "manager"] },
  { href: "/dashboard/surveys", label: "Surveys", icon: "📊", roles: ["super_admin", "hr_admin"] },
  { href: "/dashboard/employees", label: "Employees", icon: "👤", roles: ["super_admin", "hr_admin"] },
  { href: "/dashboard/admin", label: "Admin", icon: "⚙️", roles: ["super_admin"] },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <div className="w-56 flex-shrink-0 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">L</span>
          </div>
          <div>
            <div className="text-white text-sm font-semibold">LOP</div>
            <div className="text-slate-400 text-xs">Assessment</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="p-3 border-t border-slate-700">
        <span className="inline-block px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-md capitalize">
          {role.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}
