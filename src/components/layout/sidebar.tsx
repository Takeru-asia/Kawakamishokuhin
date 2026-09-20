"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Thermometer,
  Search,
  ShieldCheck,
  Target,
  TrendingDown,
  Package,
  Layers,
  Building2,
  Users,
  MessageSquare,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    items: [
      { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
    ],
  },
  {
    title: "HACCP管理",
    items: [
      { href: "/production", label: "製造実績", icon: ClipboardList },
      { href: "/temperature", label: "温度管理", icon: Thermometer },
      { href: "/lots", label: "ロット追跡", icon: Search },
      { href: "/hygiene", label: "衛生管理", icon: ShieldCheck },
    ],
  },
  {
    title: "原価管理",
    items: [
      { href: "/targets", label: "製造目標", icon: Target },
      { href: "/loss", label: "ロス管理", icon: TrendingDown },
    ],
  },
  {
    title: "マスタ管理",
    items: [
      { href: "/master/products", label: "製品マスタ", icon: Package },
      { href: "/master/materials", label: "原材料マスタ", icon: Layers },
      { href: "/master/facilities", label: "設備マスタ", icon: Building2 },
      { href: "/master/users", label: "ユーザー管理", icon: Users },
    ],
  },
  {
    title: "サポート",
    items: [
      { href: "/feedback", label: "フィードバック", icon: MessageSquare },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={cn(
          "fixed left-0 top-0 w-60 h-screen bg-gradient-to-b from-[#1a5f2a] to-[#0d3d18] text-white py-5 overflow-y-auto z-50 transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-5 pb-5 border-b border-white/10 mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">川上食品</h1>
            <span className="text-xs opacity-80">HACCP管理システム</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
            aria-label="メニューを閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {navSections.map((section, si) => (
          <div key={si} className="mb-2">
            {section.title && (
              <div className="px-5 py-2.5 text-[11px] uppercase tracking-wider opacity-60">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-5 py-3 text-sm transition-colors hover:bg-white/10",
                    isActive && "bg-white/15 border-l-3 border-[#4ade80]"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 opacity-90" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}
