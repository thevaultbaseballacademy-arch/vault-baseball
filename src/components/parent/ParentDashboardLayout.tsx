import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BarChart3, BookOpen, GraduationCap, Activity,
  Menu, X, ChevronRight, MessageSquare, ClipboardCheck,
  Dumbbell, Download, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "My Athletes", path: "/parent", icon: Users },
  { label: "Progress", path: "/parent/progress", icon: BarChart3 },
  { label: "Lessons", path: "/parent/lessons", icon: BookOpen },
  { label: "Training", path: "/parent/training", icon: Dumbbell },
  { label: "Wellness", path: "/parent/wellness", icon: Activity },
  { label: "Recruiting", path: "/parent/recruiting", icon: GraduationCap },
  { label: "Recruiting Ed", path: "/parent/recruiting-education", icon: BookOpen },
  { label: "Financial Plan", path: "/parent/financial-planning", icon: DollarSign },
  { label: "Messages", path: "/parent/messages", icon: MessageSquare },
  { label: "Downloads", path: "/parent/downloads", icon: Download },
];

const ParentDashboardLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/parent") return location.pathname === "/parent";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl text-foreground">PARENT PORTAL</h2>
          <p className="text-xs text-muted-foreground mt-1">Your athlete's world — at a glance</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">Read-only access · Data powered by coaches</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-display text-lg text-foreground">PARENT PORTAL</h2>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 space-y-1 border-t border-border"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            ))}
          </motion.nav>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 lg:overflow-y-auto">
        <div className="pt-20 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ParentDashboardLayout;
