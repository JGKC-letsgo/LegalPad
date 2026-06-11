import React from "react";
import { Link, useLocation } from "wouter";
import { Landmark, Briefcase, LayoutDashboard, Plus, LogOut } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const navItems = [
    { href: "/matters", label: "Dashboard", icon: LayoutDashboard },
    { href: "/matters", label: "All Matters", icon: Briefcase },
    { href: "/matters/new", label: "New Intake", icon: Plus },
  ];

  const uniqueNavItems = [
    { href: "/matters", label: "All Matters", icon: Briefcase },
    { href: "/matters/new", label: "New Intake", icon: Plus },
  ];

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "?"
    : "?";

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Landmark className="h-6 w-6 text-accent mr-3" />
          <span className="font-serif font-bold text-lg tracking-tight">Legalpad</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4 px-2">Workspace</div>
          {uniqueNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/matters/new"
                ? location === "/matters/new"
                : location === item.href || (location.startsWith(item.href) && location !== "/matters/new");
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.emailAddresses[0]?.emailAddress ?? ""}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex w-full items-center px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 z-10 print:hidden">
          <div className="md:hidden flex items-center">
            <Landmark className="h-5 w-5 text-accent mr-2" />
            <span className="font-serif font-bold">Legalpad</span>
          </div>
          <div className="hidden md:flex flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
              {initials}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-background p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
