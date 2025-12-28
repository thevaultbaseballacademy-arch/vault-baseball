import { motion } from "framer-motion";
import { Star, Quote, TrendingUp } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marcus Johnson",
    role: "College Player, D1 Program",
    content: "The Velocity System helped me add 12 mph to my exit velocity in just 8 weeks. The data-driven approach made all the difference.",
    rating: 5,
    avatar: "MJ",
    metric: "+12 MPH EV",
  },
  {
    id: 2,
    name: "Tyler Rodriguez",
    role: "High School Pitcher",
    content: "My pop time dropped from 2.1 to 1.95 using the Speed & Agility system. College scouts are now reaching out.",
    rating: 5,
    avatar: "TR",
    metric: "-0.15s Pop Time",
  },
  {
    id: 3,
    name: "Coach Williams",
    role: "Travel Ball Organization",
    content: "We've implemented Vault's training systems across our entire program. The athlete dashboard makes tracking progress seamless.",
    rating: 5,
    avatar: "CW",
    metric: "25+ Athletes",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
            Athlete Results
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            PROVEN PERFORMANCE
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Real results from athletes using Vault's data-driven training systems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 relative group hover:border-foreground/20 transition-all duration-300 hover:shadow-lg"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-muted-foreground/10" />
              
              {/* Metric Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-foreground text-sm font-medium mb-4">
                <TrendingUp className="w-4 h-4" />
                {testimonial.metric}
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-display text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: "500+", label: "Athletes Trained" },
            { value: "25+", label: "College Commits" },
            { value: "4.9", label: "Average Rating" },
            { value: "95%", label: "See Improvements" },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-display text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
