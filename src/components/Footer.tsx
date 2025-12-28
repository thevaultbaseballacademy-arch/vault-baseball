import { Instagram, Twitter, Youtube, Mail, Shield } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    training: [
      { name: "Velocity System", href: "#velocity" },
      { name: "Strength & Conditioning", href: "#strength" },
      { name: "Speed & Agility", href: "#speed" },
      { name: "Throwing & Arm Care", href: "#throwing" },
      { name: "Mindset Training", href: "#mindset" },
    ],
    programs: [
      { name: "Youth Programs", href: "#youth" },
      { name: "High School", href: "#highschool" },
      { name: "College", href: "#college" },
      { name: "Pro Development", href: "#pro" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Our Coaches", href: "#coaches" },
      { name: "Contact", href: "#contact" },
      { name: "Careers", href: "#careers" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
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
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
              Develop elite baseball athletes through data-driven performance systems. 
              Part of the Vault Sports Performance ecosystem.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4">TRAINING</h4>
            <ul className="space-y-2">
              {footerLinks.training.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">PROGRAMS</h4>
            <ul className="space-y-2">
              {footerLinks.programs.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">COMPANY</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">SUPPORT</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Vault Baseball. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Data-driven performance for elite athletes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
