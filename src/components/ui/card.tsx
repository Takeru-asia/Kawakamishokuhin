import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, action, children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm", className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
