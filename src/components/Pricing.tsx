import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    id: 1,
    name: "Basic",
    description: "For athletes just getting started",
    price: 29,
    period: "/month",
    features: [
      "Access to 2 training systems",
      "Weekly programming updates",
      "Basic metrics tracking",
      "Community forum access",
      "Email support",
    ],
    popular: false,
  },
  {
    id: 2,
    name: "Performance",
    description: "For serious athletes ready to compete",
    price: 59,
    period: "/month",
    features: [
      "Access to all 5 training systems",
      "Personalized programming",
      "Advanced metrics dashboard",
      "Video analysis (2x/month)",
      "Coach feedback & notes",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Elite",
    description: "For athletes pursuing the next level",
    price: 149,
    period: "/month",
    features: [
      "Everything in Performance",
      "1-on-1 virtual coaching sessions",
      "Custom program design",
      "Unlimited video analysis",
      "College recruiting guidance",
      "Direct coach messaging",
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
            Membership Tiers
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            CHOOSE YOUR PATH
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Select the membership that matches your training goals and commitment level.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card border rounded-2xl p-8 ${
                plan.popular
                  ? "border-foreground shadow-xl scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-foreground text-background text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-display text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-display text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-foreground" />
                    </div>
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "vault" : "outline"}
                size="lg"
                className="w-full"
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Coach Membership */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-3xl mx-auto text-center p-8 rounded-2xl border border-border bg-card"
        >
          <h3 className="font-display text-2xl text-foreground mb-2">Coach & Team Memberships</h3>
          <p className="text-muted-foreground mb-4">
            Program templates, licensing rights, drill libraries, and education modules for coaches and organizations.
          </p>
          <Button variant="outline">Contact for Pricing</Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
