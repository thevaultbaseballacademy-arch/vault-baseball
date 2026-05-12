import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CalendarDays, ClipboardList, Layers, UserCog, LayoutDashboard, ArrowLeft } from "lucide-react";
import { useStaffAccess } from "@/hooks/useStaffAccess";

const navItems = [
  { to: "/ops", label: "Today", icon: LayoutDashboard, end: true },
  { to: "/ops/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/ops/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/ops/resources", label: "Resources", icon: Layers, adminOnly: true },
  { to: "/ops/coaches", label: "Coaches", icon: UserCog, adminOnly: true },
];

const OpsLayout = () => {
  const { isAdmin } = useStaffAccess();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar (desktop) / top tabs (mobile) */}
      <aside className="md:w-60 md:border-r border-border md:min-h-screen bg-card/40 backdrop-blur">
        <div className="px-5 py-5 border-b border-border hidden md:block">
          <NavLink to="/dashboard" className="text-xs font-display tracking-[0.3em] text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> VAULT OS
          </NavLink>
          <p className="mt-2 text-sm font-display tracking-[0.2em] text-primary">SCHEDULING</p>
        </div>
        <nav className="flex md:flex-col gap-1 p-2 overflow-x-auto md:overflow-visible">
          {navItems
            .filter((i) => !i.adminOnly || isAdmin)
            .map((i) => {
              const active = i.end ? pathname === i.to : pathname.startsWith(i.to);
              return (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={i.end}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <i.icon className="w-4 h-4" />
                  {i.label}
                </NavLink>
              );
            })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default OpsLayout;
