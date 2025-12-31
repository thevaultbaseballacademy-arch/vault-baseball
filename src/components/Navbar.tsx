import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import vaultLogo from "@/assets/vault-logo.png";
import NotificationBell from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkUserRoles(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkUserRoles(session.user.id), 0);
      } else {
        setIsCoach(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoles = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (data) {
        setIsCoach(data.some(r => r.role === 'coach'));
        setIsAdmin(data.some(r => r.role === 'admin'));
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { 
      name: "The Framework", 
      href: "/#pillars",
      dropdown: [
        { name: "Velocity", href: "/#pillars" },
        { name: "Athleticism", href: "/#pillars" },
        { name: "Utility", href: "/#pillars" },
        { name: "Longevity", href: "/#pillars" },
        { name: "Transfer", href: "/#pillars" },
      ]
    },
    { 
      name: "Training Systems", 
      href: "/courses",
      dropdown: [
        { name: "Velocity System", href: "/courses" },
        { name: "Athleticism Program", href: "/courses" },
        { name: "Utility Development", href: "/courses" },
        { name: "Longevity & Arm Care", href: "/courses" },
        { name: "Transfer Training", href: "/courses" },
      ]
    },
    { 
      name: "Pathways", 
      href: "/pathway/youth",
      dropdown: [
        { name: "Youth (Ages 8-12)", href: "/pathway/youth" },
        { name: "Academy (Ages 13-18)", href: "/pathway/academy" },
      ]
    },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img 
              src={vaultLogo} 
              alt="The Vault Baseball Academy" 
              className="h-12 md:h-14 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className="w-4 h-4 ml-1" />}
                </a>
                
                {/* Dropdown */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-card rounded-xl shadow-lg border border-border overflow-hidden"
                    >
                      {link.dropdown.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                <NotificationBell userId={user.id} />
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                    Admin
                  </Button>
                )}
                {isCoach && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/coach")}>
                    Coach
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => navigate("/vault")}>
                  VAULT™
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/my-programs")}>
                  My Programs
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/community")}>
                  Community
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/checkin")}>
                  Check-in
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/schedule")}>
                  Schedule
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/account")}>
                  Account
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Log In
                </Button>
                <Button variant="vault" size="sm" onClick={() => navigate("/auth")}>
                  Join Vault
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t border-border overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <a
                      href={link.href}
                      className="flex items-center justify-between px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors rounded-lg font-medium"
                      onClick={() => !link.dropdown && setIsOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        {link.name}
                      </span>
                      {link.dropdown && <ChevronDown className="w-4 h-4" />}
                    </a>
                    {link.dropdown && (
                      <div className="ml-4 border-l border-border">
                        {link.dropdown.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-border">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Button variant="ghost" className="justify-center" onClick={() => { navigate("/admin"); setIsOpen(false); }}>
                          Admin
                        </Button>
                      )}
                      {isCoach && (
                        <Button variant="ghost" className="justify-center" onClick={() => { navigate("/coach"); setIsOpen(false); }}>
                          Coach
                        </Button>
                      )}
                      <Button variant="ghost" className="justify-center" onClick={() => { navigate("/dashboard"); setIsOpen(false); }}>
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => { navigate("/my-programs"); setIsOpen(false); }}>
                        My Programs
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => { navigate("/community"); setIsOpen(false); }}>
                        Community
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => { navigate("/checkin"); setIsOpen(false); }}>
                        Check-in
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => { navigate("/schedule"); setIsOpen(false); }}>
                        Schedule
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => { navigate("/account"); setIsOpen(false); }}>
                        Account
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="justify-center" onClick={() => { navigate("/auth"); setIsOpen(false); }}>
                        Log In
                      </Button>
                      <Button variant="vault" onClick={() => { navigate("/auth"); setIsOpen(false); }}>
                        Join Vault
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
