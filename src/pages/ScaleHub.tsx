// VAULT OS — Phase 3: Scale Hub.
// Consolidates the Scale bucket (coaches + organizations) under a single entry
// without touching the locked OwnerCommandCenter or coach dashboards.
// Surfaces existing destinations with role-aware shortcuts.

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, Award, Briefcase, Crown, Layers } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NextActionStrip from "@/components/pathway/NextActionStrip";
import { Button } from "@/components/ui/button";
import { IA_BUCKETS } from "@/lib/ia";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAuth } from "@/hooks/useRoleAuth";

const ScaleHub = () => {
  const { user } = useAuth();
  const { isCoach, isOwner, isAdmin } = useRoleAuth();
  const scale = IA_BUCKETS.find((b) => b.key === "scale")!;

  // Role-aware shortcuts (additive — never replaces existing dashboards)
  const shortcuts: Array<{ label: string; href: string; icon: typeof Crown; show: boolean }> = [
    { label: "Owner Command Center", href: "/owner", icon: Crown, show: isOwner || isAdmin },
    { label: "Coach Dashboard", href: "/coach-dashboard", icon: Briefcase, show: isCoach },
    { label: "Coach Athletes", href: "/coach/athletes", icon: Users, show: isCoach },
  ];
  const visibleShortcuts = shortcuts.filter((s) => s.show);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              <Building2 className="h-3.5 w-3.5" />
              <span>Scale</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground mb-2">
              Scale — for coaches & organizations
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-6">{scale.tagline}</p>

            <NextActionStrip
              title="Scale — coach network, certification, and team licensing"
              audience="Coaches & Organizations"
              description="One hub for becoming a Vault-Verified coach, joining the marketplace, and licensing for teams and orgs."
            />

            {user && visibleShortcuts.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Your shortcuts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {visibleShortcuts.map((s) => {
                    const Icon = s.icon;
                    return (
                      <Button key={s.href} asChild variant="outline" className="justify-between h-auto py-3">
                        <Link to={s.href}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {s.label}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">All Scale destinations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scale.links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group border border-border/50 bg-card/40 hover:bg-card/70 rounded-xl p-4 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary/70" />
                        <span className="font-medium text-foreground truncate">{link.name}</span>
                      </div>
                      {link.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{link.description}</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard
                icon={Award}
                title="Vault-Verified Coach"
                copy="Earn the credential trusted by athletes and orgs."
                href="/products/certified-coach"
              />
              <FeatureCard
                icon={Users}
                title="Coach Network"
                copy="Get listed in the marketplace and accept bookings."
                href="/marketplace"
              />
              <FeatureCard
                icon={Building2}
                title="Org Licensing"
                copy="Roll out VAULT to your full team or organization."
                href="/products/org-licensing"
              />
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function FeatureCard({
  icon: Icon,
  title,
  copy,
  href,
}: {
  icon: typeof Crown;
  title: string;
  copy: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="border border-border/50 bg-gradient-to-b from-card/60 to-card/20 rounded-xl p-5 hover:border-primary/40 transition-colors block"
    >
      <Icon className="h-5 w-5 text-primary mb-2" />
      <div className="font-display text-base text-foreground">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{copy}</p>
      <div className="mt-3 inline-flex items-center text-xs text-primary">
        Open <ArrowRight className="ml-1 h-3 w-3" />
      </div>
    </Link>
  );
}

export default ScaleHub;
