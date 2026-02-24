"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface HeaderProps {
  title: string;
  userName?: string;
}

export function Header({ title, userName }: HeaderProps) {
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-[#1a5f2a]">{title}</h2>
        <span className="text-sm text-gray-500">{today}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#1a5f2a] flex items-center justify-center text-white text-sm">
          {userName?.charAt(0) || "U"}
        </div>
        <span className="text-sm text-gray-700">{userName || "ユーザー"}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="ログアウト"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
