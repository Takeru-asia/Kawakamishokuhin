import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "danger";
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "info", children, className }: AlertProps) {
  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: AlertTriangle,
  }[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg",
        {
          "bg-blue-50 text-blue-700": variant === "info",
          "bg-green-50 text-green-700": variant === "success",
          "bg-yellow-50 text-yellow-700": variant === "warning",
          "bg-red-50 text-red-700": variant === "danger",
        },
        className
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="text-sm">{children}</div>
    </div>
  );
}
