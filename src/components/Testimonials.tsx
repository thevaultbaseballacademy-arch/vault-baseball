import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marcus Johnson",
    role: "College Player, UCLA",
    content: "The hitting course completely transformed my swing. My batting average went from .250 to .340 in one season. This is the real deal.",
    rating: 5,
    avatar: "MJ",
  },
  {
    id: 2,
    name: "Tyler Rodriguez",
    role: "High School Pitcher",
    content: "I added 8 mph to my fastball using the pitching mechanics course. Coach couldn't believe the improvement. Worth every penny.",
    rating: 5,
    avatar: "TR",
  },
  {
    id: 3,
    name: "Jake Williams",
    role: "Travel Ball Coach",
    content: "I use these courses with my entire team. The production quality and instruction are MLB-level. My players have improved dramatically.",
    rating: 5,
    avatar: "JW",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            TRUSTED BY PLAYERS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Hear from athletes who've transformed their game with our training programs.
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
              className="bg-card border border-border rounded-2xl p-8 relative group hover:border-primary/50 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg">
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
      </div>
    </section>
  );
};

export default Testimonials;
