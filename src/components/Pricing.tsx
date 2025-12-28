import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    id: 1,
    name: "Single Course",
    description: "Perfect for focusing on one skill",
    price: 149,
    period: "one-time",
    features: [
      "Access to one course of your choice",
      "Lifetime access to content",
      "Downloadable resources",
      "Community forum access",
      "Certificate of completion",
    ],
    popular: false,
  },
  {
    id: 2,
    name: "All-Access Pass",
    description: "Complete training for serious players",
    price: 39,
    period: "/month",
    features: [
      "Unlimited access to all courses",
      "New content added monthly",
      "Live Q&A sessions with coaches",
      "Personalized training plans",
      "Video swing analysis (monthly)",
      "Priority community support",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Team License",
    description: "Perfect for coaches and organizations",
    price: 299,
    period: "/month",
    features: [
      "Up to 25 player accounts",
      "All-Access benefits for each player",
      "Team progress dashboard",
      "Custom training programs",
      "Dedicated coach support",
      "Bulk discount for larger teams",
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            Pricing Plans
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            INVEST IN YOUR GAME
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose the plan that fits your training goals. All plans include our satisfaction guarantee.
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
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
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
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="lg"
                className="w-full"
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
