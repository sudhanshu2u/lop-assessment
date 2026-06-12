"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function LangToggle({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle(l: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (l === "en") p.delete("lang");
    else p.set("lang", l);
    router.replace(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
      <button
        onClick={() => toggle("en")}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${lang === "en" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
      >
        EN
      </button>
      <button
        onClick={() => toggle("hi")}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${lang === "hi" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
      >
        हिंदी
      </button>
    </div>
  );
}
