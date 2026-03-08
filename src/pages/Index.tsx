import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Download, Check, Zap, Target, Shield, TrendingUp, Users, Star, ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import vaultLogo from "@/assets/vault-logo-new.webp";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-4 py-1.5 bg-foreground text-background text-xs font-display tracking-widest mb-6">
                THE SYSTEM THAT BUILDS VELOCITY
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-foreground leading-[0.9] mb-6">
                STOP GUESSING.<br />START DEVELOPING.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Vault Baseball is an elite, system-driven development platform that gives athletes 
                the exact training, metrics, and coaching they need to gain measurable velocity and get recruited.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6 font-display tracking-wide" onClick={() => navigate("/free-velocity-guide")}>
                  <Download className="w-5 h-5 mr-2" />
                  GET FREE VELOCITY GUIDE
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 font-display tracking-wide border-foreground text-foreground hover:bg-foreground hover:text-background" onClick={() => {
                  // Trigger Eddie AI chat
                  const btn = document.querySelector('[aria-label="Ask Eddie AI"]') as HTMLButtonElement;
                  if (btn) btn.click();
                }}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  ASK EDDIE AI
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* THE VAULT SYSTEM */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-widest text-background/50 mb-3 block">THE V.A.U.L.T. FRAMEWORK</span>
              <h2 className="text-4xl md:text-5xl font-display mb-4">5 PILLARS OF ELITE DEVELOPMENT</h2>
              <p className="text-background/60 text-lg max-w-2xl mx-auto">
                Every program, drill, and metric inside Vault maps to one of five development pillars — 
                giving athletes a complete, measurable system for growth.
              </p>
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { letter: "V", name: "Velocity", color: "hsl(var(--vault-velocity))", desc: "Arm speed, exit velo, throwing metrics" },
                { letter: "A", name: "Athleticism", color: "hsl(var(--vault-athleticism))", desc: "Speed, agility, explosive power" },
                { letter: "U", name: "Utility", color: "hsl(var(--vault-utility))", desc: "Game IQ, positional versatility" },
                { letter: "L", name: "Longevity", color: "hsl(var(--vault-longevity))", desc: "Arm care, injury prevention" },
                { letter: "T", name: "Transfer", color: "hsl(var(--vault-transfer))", desc: "Practice-to-game carry over" },
              ].map((pillar, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 border border-background/10">
                  <div className="text-5xl font-display mb-2" style={{ color: pillar.color }}>{pillar.letter}</div>
                  <p className="font-display text-sm tracking-wide mb-1">{pillar.name}</p>
                  <p className="text-xs text-background/40">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">BUILT FOR ATHLETES WHO ARE SERIOUS</h2>
              <p className="text-lg text-muted-foreground">If any of these describe you, Vault was built for your development.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Target, title: "Athletes (12-18)", points: ["Want to throw harder", "Need a structured program", "Preparing for showcases", "Targeting college recruitment"] },
                { icon: Users, title: "Parents", points: ["Want measurable progress", "Tired of random training", "Looking for expert systems", "Need injury prevention focus"] },
                { icon: Shield, title: "Coaches", points: ["Need development curriculum", "Want metrics-driven programs", "Building team systems", "Coach certification available"] },
              ].map((group, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-card border border-border p-8">
                  <group.icon className="w-8 h-8 text-foreground mb-4" />
                  <h3 className="font-display text-xl text-foreground mb-4">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.points.map((p, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-foreground shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">SOUND FAMILIAR?</h2>
              <p className="text-lg text-muted-foreground">These are the most common roadblocks we see — and exactly what Vault solves.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { problem: "Training hard but velocity isn't increasing", solution: "Vault identifies the exact mechanical, physical, and movement fixes holding you back." },
                { problem: "No idea what drills actually work", solution: "Every drill in Vault is mapped to specific outcomes with measurable benchmarks." },
                { problem: "Worried about arm injury", solution: "Our Longevity pillar includes arm care protocols used by professional programs." },
                { problem: "Don't know if you're college-ready", solution: "Vault tracks D1/D2/D3 benchmarks so you always know where you stand." },
                { problem: "Coaches give conflicting advice", solution: "One unified system based on data, not opinion. Vault standardizes development." },
                { problem: "Spending money with no results", solution: "Vault's metrics dashboard shows exactly what's improving and what needs work." },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-card border border-border p-6">
                  <p className="text-foreground font-display text-sm mb-2">❌ {item.problem}</p>
                  <p className="text-muted-foreground text-sm">✅ {item.solution}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* OFFER LADDER */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">YOUR DEVELOPMENT PATH</h2>
              <p className="text-lg text-muted-foreground">Start free. Go as deep as your goals demand.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "01", name: "Free Velocity Guide", price: "FREE", desc: "5 mistakes killing your velocity. Instant download.", cta: "Download Now", href: "/free-velocity-guide", highlight: false },
                { step: "02", name: "Velo-Check Analysis", price: "$79", desc: "Upload video. Get 3 exact fixes from Vault coaches in 48hrs.", cta: "Get Velo-Check", href: "/products/velo-check", highlight: false },
                { step: "03", name: "Vault Velocity System", price: "$399", desc: "Complete 12-week self-guided velocity development program.", cta: "Start System", href: "/products/velocity-system", highlight: true },
                { step: "04", name: "Performance Membership", price: "$59/mo", desc: "Ongoing coaching, metrics tracking, structured programming.", cta: "Join Now", href: "/#pricing", highlight: false },
              ].map((offer, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`relative p-6 border flex flex-col ${offer.highlight ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border"}`}
                >
                  {offer.highlight && (
                    <span className="absolute -top-3 left-4 px-3 py-0.5 bg-destructive text-white text-[10px] font-display tracking-wide">MOST POPULAR</span>
                  )}
                  <span className={`text-xs font-display tracking-widest mb-3 ${offer.highlight ? "text-background/50" : "text-muted-foreground"}`}>STEP {offer.step}</span>
                  <h3 className="font-display text-lg mb-1">{offer.name}</h3>
                  <p className="text-3xl font-display mb-3">{offer.price}</p>
                  <p className={`text-sm mb-6 flex-1 ${offer.highlight ? "text-background/60" : "text-muted-foreground"}`}>{offer.desc}</p>
                  <Button
                    variant={offer.highlight ? "secondary" : "vault"}
                    className="w-full"
                    onClick={() => navigate(offer.href)}
                  >
                    {offer.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">ATHLETES ARE GAINING VELOCITY</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Jake M.", age: "16, RHP", quote: "Gained 6 mph in 8 weeks on the Velocity System. The drills actually make sense.", stat: "+6 MPH" },
                { name: "Marcus T.", age: "14, IF/P", quote: "Vault showed me exactly where I was losing velocity in my mechanics. Game changer.", stat: "+4 MPH" },
                { name: "Dylan R.", age: "17, RHP", quote: "The Performance membership keeps me accountable. My coach can track everything.", stat: "+8 MPH" },
              ].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.age}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-sm font-display">{t.stat}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">COMMON QUESTIONS</h2>
            </div>
            <FAQSection />
          </motion.div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-display mb-4">READY TO DEVELOP?</h2>
            <p className="text-lg text-background/60 mb-8">
              Join the athletes who stopped guessing and started gaining real velocity with Vault Baseball.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 font-display tracking-wide" onClick={() => navigate("/free-velocity-guide")}>
                <Download className="w-5 h-5 mr-2" />
                FREE VELOCITY GUIDE
              </Button>
              <Button size="lg" className="text-lg px-8 py-6 font-display tracking-wide bg-background text-foreground hover:bg-background/90" onClick={() => navigate("/products/velocity-system")}>
                START THE VELOCITY SYSTEM
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What age is Vault designed for?", a: "Vault is built for baseball athletes ages 12-18, though our systems are used by college athletes and coaches as well." },
    { q: "Do I need any special equipment?", a: "No special equipment is required. A ball, glove, and access to a field or cage is all you need. We integrate with optional devices like Rapsodo and Blast Motion for advanced metrics." },
    { q: "How is Vault different from private lessons?", a: "Private lessons give you one coach's opinion for one hour. Vault gives you a complete development system with measurable benchmarks, structured programming, and ongoing tracking across all 5 pillars." },
    { q: "What if I'm not sure which product to start with?", a: "Ask Eddie AI — our virtual development advisor. He'll ask about your goals, age, and current level, then recommend the perfect starting point." },
    { q: "Is there a money-back guarantee?", a: "We stand behind our programs. If you complete the work and don't see measurable improvement, contact us to discuss your situation." },
    { q: "Can coaches use Vault for their teams?", a: "Absolutely. We offer team licenses, coach certifications, and organizational tools. Check out our Team Licenses or Org Starter Pack for details." },
  ];

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border bg-card">
          <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            <span className="font-display text-foreground text-sm">{faq.q}</span>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Index;
