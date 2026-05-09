import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Compass, Dumbbell, Eye, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const buckets = [
    { to: "/evaluate", label: "Assess", icon: Compass, desc: "Free evaluation & baselines" },
    { to: "/products", label: "Train", icon: Dumbbell, desc: "Programs, bundles, coaching" },
    { to: "/recruiting", label: "Get Seen", icon: Eye, desc: "Audits, tryouts, showcases" },
    { to: "/certifications", label: "Scale", icon: Building2, desc: "Coach & org tools" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-2xl w-full text-center">
          <p className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-3">ERROR 404</p>
          <h1 className="text-4xl md:text-6xl font-display text-foreground mb-3">PAGE NOT FOUND.</h1>
          <p className="text-muted-foreground mb-2 text-sm break-all">
            <code className="text-xs">{location.pathname}</code>
          </p>
          <p className="text-muted-foreground mb-8">
            That route doesn't exist in the VAULT OS. Pick a path below or head home.
          </p>
          <Link to="/"><Button variant="vault" className="mb-10"><Home className="w-4 h-4 mr-2" />Return Home</Button></Link>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {buckets.map(b => (
              <Link key={b.to} to={b.to} className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left">
                <b.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-display text-foreground">{b.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
