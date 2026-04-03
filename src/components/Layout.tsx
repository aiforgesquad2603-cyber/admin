import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, List, PlayCircle, Users, BarChart3, Settings, Bell, Search, UserCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/store/authStore";

const sidebarLinks = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Quizzes", href: "/quizzes", icon: List },
  { name: "Live Control", href: "/live", icon: PlayCircle },
  { name: "Users", href: "/users", icon: Users },
  { name: "Results", href: "/results", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">QuizMaster</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {link.name}
                {link.name === "Live Control" && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserCircle className="w-8 h-8 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || "Admin"}</span>
              <span className="text-xs text-muted-foreground">{user?.email || "admin@quizmaster.io"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search quizzes, users, or reports..." 
                className="w-full bg-accent/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-card" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
