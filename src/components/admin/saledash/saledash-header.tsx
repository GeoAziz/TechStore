"use client";

import { Bell, Calendar, ChevronDown, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface SaledashHeaderProps {
  adminName: string;
  notificationsCount?: number;
}

export function SaledashHeader({ adminName, notificationsCount = 0 }: SaledashHeaderProps) {
  const currentDate = format(new Date(), "dd MMM yyyy");

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-headline">
          Good Morning, <span className="text-lime-600 dark:text-[#bef264]">{adminName}</span>!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your store today
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Date Capsule */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-lime-500" />
          <span>{currentDate}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative w-9 h-9 rounded-xl bg-card border border-border hover:bg-muted flex items-center justify-center text-foreground transition-all shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
              {notificationsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

