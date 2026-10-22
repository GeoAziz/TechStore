"use client";

import { Search, Bell, Calendar } from "lucide-react";
import { format } from "date-fns";

interface PixelHeaderProps {
  title?: string;
  notificationsCount?: number;
}

export function PixelHeader({ title = "Overview", notificationsCount = 0 }: PixelHeaderProps) {
  const currentDate = format(new Date(), "dd MMM yyyy");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-headline">
          {title}
        </h1>
      </div>

      {/* Right Controls: Search + Date + Notifications */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 lg:w-56"
          />
        </div>

        {/* Date Capsule */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>{currentDate}</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative w-9 h-9 rounded-xl bg-card border border-border hover:bg-muted flex items-center justify-center text-foreground transition-all shadow-sm"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black shadow-sm">
              {notificationsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
