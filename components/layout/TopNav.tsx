"use client";

import { signOut } from "next-auth/react";

interface Props {
  user: { name: string; email: string; role: string };
}

export default function TopNav({ user }: Props) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
