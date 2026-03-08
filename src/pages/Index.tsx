import { motion } from "framer-motion";
import {
  ArrowRight, MessageCircle, Download, Check, Zap, Target, Shield,
  TrendingUp, Users, Star, ChevronDown, X, AlertTriangle, Gauge,
  Dumbbell, Heart, Shuffle, BarChart3, BookOpen, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Index = () => {
  const navigate = useNavigate();

  const openEddie = () => {
    const btn = document.querySelector('[aria-label="Ask Eddie AI"]') as HTMLButtonElement;
    if (btn) btn.click();
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground" />
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-5 py-1.5 border border-primary-foreground/20 text-primary-foreground/60 text-xs font-display tracking-[0.3em] mb-8">
                BASEBALL DEVELOPMENT — SYSTEMATIZED
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-primary-foreground leading-[0.9] mb-6">
                BUILD A REAL BASEBALL<br />DEVELOPMENT SYSTEM
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto mb-12 font-body">
                Stop guessing. Vault gives athletes a structured plan for velocity, strength, arm care, and long-term development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                  onClick={openEddie}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  ASK EDDIE AI
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-6 font-display tracking-wide border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
                  onClick={() => navigate("/free-velocity-guide")}
                >
                  <Download className="w-5 h-5 mr-2" />
                  GET THE FREE VELOCITY GUIDE
                </Button>
              </div>
              {/* trust line */}
              <p className="mt-8 text-xs text-primary-foreground/30 font-display tracking-widest">
                TRUSTED BY 500+ ATHLETES &nbsp;·&nbsp; AGES 12-18 &nbsp;·&nbsp; NO CARD REQUIRED
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM: COMMON ATHLETE STRUGGLES ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">THE PROBLEM</span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">DOES THIS SOUND LIKE YOU?</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Most athletes are working hard — but not getting results. Here's why.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Gauge, text: "You're throwing hard in practice but your velocity won't climb" },
                { icon: AlertTriangle, text: "You've had arm soreness and don't know if you're training safely" },
                { icon: Clock, text: "You're spending money on lessons but nothing feels structured" },
                { icon: X, text: "You get conflicting advice from every coach, trainer, and YouTube video" },
                { icon: BarChart3, text: "You have no way to measure if you're actually improving" },
                { icon: Target, text: "College showcase is coming and you don't know if you're ready" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-4 p-5 bg-card border border-border"
                >
                  <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-destructive" />
                  </div>
                  <p className="text-sm text-foreground font-body leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY RANDOM TRAINING FAILS ── */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">THE ROOT CAUSE</span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">RANDOM TRAINING PRODUCES RANDOM RESULTS</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Without a system, athletes plateau. Here's the pattern we see over and over.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  title: "No baseline",
                  desc: "Athletes train without knowing their current velocity, movement quality, or physical benchmarks. If you can't measure it, you can't improve it.",
                },
                {
                  num: "02",
                  title: "No structure",
                  desc: "Jumping between drills, programs, and trainers creates gaps. Development requires progressive overload across every pillar — not random workouts.",
                },
                {
                  num: "03",
                  title: "No accountability",
                  desc: "Without tracking and coaching, athletes lose momentum. The best gains come from consistent, monitored, data-backed development.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="bg-card border border-border p-8"
                >
                  <span className="text-4xl font-display text-border">{item.num}</span>
                  <h3 className="font-display text-xl text-foreground mt-3 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW VAULT SOLVES IT — THE SYSTEM ── */}
      <section className="py-20 md:py-28 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-[0.25em] text-primary-foreground/40 mb-3 block">THE SOLUTION</span>
              <h2 className="text-4xl md:text-6xl font-display mb-4">THE V.A.U.L.T. SYSTEM</h2>
              <p className="text-lg text-primary-foreground/50 max-w-2xl mx-auto">
                Five pillars. One system. Every drill, metric, and coaching decision maps to measurable development.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { letter: "V", name: "Velocity", icon: Zap, color: "var(--vault-velocity)", desc: "Arm speed & exit velo" },
                { letter: "A", name: "Athleticism", icon: Dumbbell, color: "var(--vault-athleticism)", desc: "Speed, power, agility" },
                { letter: "U", name: "Utility", icon: Shuffle, color: "var(--vault-utility)", desc: "Game IQ & versatility" },
                { letter: "L", name: "Longevity", icon: Heart, color: "var(--vault-longevity)", desc: "Arm care & durability" },
                { letter: "T", name: "Transfer", icon: Target, color: "var(--vault-transfer)", desc: "Practice → game results" },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center p-6 border border-primary-foreground/10 hover:border-primary-foreground/25 transition-colors"
                >
                  <p.icon className="w-6 h-6 mx-auto mb-3" style={{ color: `hsl(${p.color})` }} />
                  <div className="text-5xl font-display mb-1" style={{ color: `hsl(${p.color})` }}>{p.letter}</div>
                  <p className="font-display text-sm tracking-wide mb-1">{p.name}</p>
                  <p className="text-[11px] text-primary-foreground/40">{p.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button
                size="lg"
                className="text-lg px-10 py-6 font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                onClick={openEddie}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                FIND YOUR STARTING POINT
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">WHO IT'S FOR</span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">BUILT FOR SERIOUS BASEBALL FAMILIES</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: "Athletes (12-18)", points: ["Want to throw harder and hit farther", "Need a plan — not random drills", "Preparing for showcases or tryouts", "Want to know if they're college-ready"] },
                { icon: Users, title: "Parents", points: ["Want to see measurable improvement", "Tired of paying for lessons with no plan", "Worried about arm health and overuse", "Need a system they can trust"] },
                { icon: BookOpen, title: "Coaches", points: ["Need a development curriculum that works", "Want metrics to track athlete progress", "Building programs across age groups", "Looking for coach certification"] },
              ].map((group, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="bg-card border border-border p-8">
                  <group.icon className="w-8 h-8 text-foreground mb-4" />
                  <h3 className="font-display text-xl text-foreground mb-5">{group.title}</h3>
                  <ul className="space-y-3">
                    {group.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
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

      {/* ── PRODUCT LADDER ── */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">THE PATH</span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">START FREE. GO AS FAR AS YOUR GOALS DEMAND.</h2>
              <p className="text-lg text-muted-foreground">Every level builds on the last. Pick your entry point.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-5">
              {[
                { step: "01", name: "Free Velocity Guide", price: "FREE", desc: "Learn the 5 mistakes that kill pitch velocity — and how to fix them. Instant download.", cta: "Download Now", href: "/free-velocity-guide", highlight: false },
                { step: "02", name: "Velo-Check Analysis", price: "$79", desc: "Upload your video. Get 3 specific mechanical fixes from Vault coaches within 48 hours.", cta: "Get Velo-Check", href: "/products/velo-check", highlight: false },
                { step: "03", name: "Vault Velocity System", price: "$399", desc: "The complete 12-week self-guided velocity program. Drills, metrics, and progressive overload built in.", cta: "Start the System", href: "/products/velocity-system", highlight: true },
                { step: "04", name: "Performance Membership", price: "$59/mo", desc: "Ongoing coaching, weekly programming, metrics tracking, and direct coach access. Cancel anytime.", cta: "Join Now", href: "/#pricing", highlight: false },
              ].map((offer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-6 border flex flex-col ${offer.highlight ? "bg-foreground text-primary-foreground border-foreground" : "bg-card text-foreground border-border"}`}
                >
                  {offer.highlight && (
                    <span className="absolute -top-3 left-4 px-3 py-1 bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest">MOST POPULAR</span>
                  )}
                  <span className={`text-xs font-display tracking-widest mb-3 ${offer.highlight ? "text-primary-foreground/40" : "text-muted-foreground"}`}>STEP {offer.step}</span>
                  <h3 className="font-display text-lg mb-1">{offer.name}</h3>
                  <p className="text-3xl font-display mb-3">{offer.price}</p>
                  <p className={`text-sm mb-6 flex-1 leading-relaxed ${offer.highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{offer.desc}</p>
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
            <p className="text-center text-sm text-muted-foreground mt-8">
              Not sure where to start?{" "}
              <button onClick={openEddie} className="underline text-foreground font-medium hover:no-underline">Ask Eddie AI</button> — he'll recommend the right product for your athlete.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">RESULTS</span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">ATHLETES ARE GAINING REAL VELOCITY</h2>
              <p className="text-lg text-muted-foreground">Measurable results from athletes using the Vault system.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Jake M.", detail: "16 · RHP · Texas", quote: "I gained 6 mph in 8 weeks on the Velocity System. The drills are structured and they actually make sense. My coach could see the difference immediately.", stat: "+6 MPH", label: "Pitching Velo" },
                { name: "Sarah T.", detail: "Parent · Son age 14", quote: "As a parent, I finally feel like we're investing in something real. We can see his metrics, track his progress, and know exactly what he's working on every week.", stat: "5-PILLAR", label: "Full Tracking" },
                { name: "Dylan R.", detail: "17 · RHP/1B · Florida", quote: "The Performance membership keeps me accountable. I know exactly where I stand for D1 benchmarks and what I need to work on. It's not guessing anymore.", stat: "+8 MPH", label: "Pitching Velo" },
                { name: "Marcus W.", detail: "14 · IF/P · California", quote: "Vault showed me exactly where I was losing velocity in my mechanics. In two months I went from 62 to 66 and I'm still climbing.", stat: "+4 MPH", label: "Pitching Velo" },
                { name: "Ryan K.", detail: "Coach · Travel Ball", quote: "I put my entire 14U team on Vault. The system gives me a framework for developing each player individually while running the same program. Game changer for coaches.", stat: "12", label: "Athletes Coached" },
                { name: "Mike D.", detail: "Parent · Son age 16", quote: "We spent $3,000 on private lessons last year with no real plan. Vault gave us more structure in one month than a year of random training.", stat: "$399", label: "Full System" },
              ].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card border border-border p-6 flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-foreground text-foreground" />)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 italic leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-end justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.detail}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-display text-foreground">{t.stat}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.label}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">FAQ</span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">COMMON QUESTIONS</h2>
            </div>
            <FAQSection />
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 md:py-32 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-display mb-4">STOP GUESSING. START DEVELOPING.</h2>
            <p className="text-lg text-primary-foreground/50 mb-10 max-w-xl mx-auto">
              Join the athletes and families who replaced random training with a real system — and started seeing results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-10 py-6 font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                onClick={openEddie}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                ASK EDDIE AI
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-6 font-display tracking-wide border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
                onClick={() => navigate("/free-velocity-guide")}
              >
                <Download className="w-5 h-5 mr-2" />
                FREE VELOCITY GUIDE
              </Button>
            </div>
            <p className="mt-8 text-xs text-primary-foreground/25 font-display tracking-widest">
              NO CREDIT CARD REQUIRED &nbsp;·&nbsp; INSTANT ACCESS &nbsp;·&nbsp; AGES 12-18
            </p>
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
    { q: "What age group is Vault designed for?", a: "Vault is built for baseball athletes ages 12-18. Our system scales to any skill level — from first-year travel ball players to pre-college showcase athletes. Coaches and parents also use the platform for team development." },
    { q: "Do I need special equipment?", a: "No. A ball, glove, and access to a field or cage is all you need to start. For advanced metrics tracking, Vault integrates with devices like Rapsodo and Blast Motion — but they're optional." },
    { q: "How is this different from private lessons?", a: "Private lessons give you one coach's opinion for one hour a week. Vault gives you a complete system: structured programming, measurable benchmarks, arm care protocols, and ongoing tracking across all 5 development pillars. It's the plan between lessons." },
    { q: "I'm not sure which product to start with.", a: "Ask Eddie AI — our development advisor. He'll ask about your goals, age, position, and current level, then recommend exactly where to start. Most athletes begin with the free guide or Velo-Check." },
    { q: "Is there a money-back guarantee?", a: "Yes. If you complete the work and don't see measurable improvement, contact us. We stand behind the system because the system works when you follow it." },
    { q: "Can coaches use Vault for their teams?", a: "Absolutely. We offer team licenses, coach certification programs, and organizational dashboards. Check out our Team Licenses or Org Starter Pack pages for details." },
    { q: "How quickly will I see results?", a: "Most athletes on the Velocity System see measurable velocity gains within 4-6 weeks. The full 12-week program is designed for sustained improvement, not quick fixes that fade." },
  ];

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border bg-card">
          <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            <span className="font-display text-foreground text-sm">{faq.q}</span>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ml-4 ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Index;
