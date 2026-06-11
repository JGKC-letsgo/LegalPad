import React from "react";
import { Link, useLocation } from "wouter";
import { Scale, Briefcase, FileText, LayoutDashboard, Plus, Settings } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/matters", label: "All Matters", icon: Briefcase },
    { href: "/matters/new", label: "New Intake", icon: Plus },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Scale className="h-6 w-6 text-accent mr-3" />
          <span className="font-serif font-bold text-lg tracking-tight">Legalpad</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4 px-2">Workspace</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href) && item.href !== "/matters/new");
            return (
              <Link 
                key={item.href} 
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

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 rounded-md cursor-pointer">
            <Settings className="h-4 w-4 mr-3" />
            Preferences
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 z-10">
          <div className="md:hidden flex items-center">
            <Scale className="h-5 w-5 text-accent mr-2" />
            <span className="font-serif font-bold">Legalpad</span>
          </div>
          <div className="hidden md:flex flex-1"></div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary border border-primary/20">
              IL
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
