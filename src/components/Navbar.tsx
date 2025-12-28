import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { 
      name: "Programs", 
      href: "#programs",
      dropdown: [
        { name: "Youth Programs", href: "#youth" },
        { name: "High School", href: "#highschool" },
        { name: "College", href: "#college" },
        { name: "Pro Development", href: "#pro" },
      ]
    },
    { 
      name: "Training Systems", 
      href: "#systems",
      dropdown: [
        { name: "Velocity System", href: "#velocity" },
        { name: "Strength & Conditioning", href: "#strength" },
        { name: "Speed & Agility", href: "#speed" },
        { name: "Throwing & Arm Care", href: "#throwing" },
        { name: "Mindset & Psychology", href: "#mindset" },
      ]
    },
    { 
      name: "Digital Products", 
      href: "#products",
      dropdown: [
        { name: "PDF Programs", href: "#pdfs" },
        { name: "Online Courses", href: "#courses" },
        { name: "Books", href: "#books" },
      ]
    },
    { name: "Vault App", href: "#app", badge: "Coming Soon" },
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
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center relative overflow-hidden">
              <Shield className="w-5 h-5 text-primary-foreground" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl leading-none text-foreground tracking-wider">
                VAULT
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-[0.2em] uppercase">
                Baseball
              </span>
            </div>
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
                  {link.badge && (
                    <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full">
                      {link.badge}
                    </span>
                  )}
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
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
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
                        {link.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full">
                            {link.badge}
                          </span>
                        )}
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
