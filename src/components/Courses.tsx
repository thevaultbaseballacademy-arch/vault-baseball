import { motion } from "framer-motion";
import { Clock, PlayCircle, Star, Zap, Target, Dumbbell, Wind, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import courseHitting from "@/assets/course-hitting.jpg";
import coursePitching from "@/assets/course-pitching.jpg";
import courseFielding from "@/assets/course-fielding.jpg";

const trainingSystems = [
  {
    id: 1,
    title: "Velocity System",
    description: "Increase bat speed, exit velocity, and throwing power with kinetic chain training.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 6,
    icon: Zap,
    tag: "Most Popular",
    metrics: ["Exit Velocity", "Bat Speed", "Throwing Velo"],
  },
  {
    id: 2,
    title: "Strength & Conditioning",
    description: "Build total-body strength, durability, and athletic foundation for peak performance.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 4,
    icon: Dumbbell,
    tag: "Foundation",
    metrics: ["Squat", "Deadlift", "Power Output"],
  },
  {
    id: 3,
    title: "Speed & Agility",
    description: "Improve sprint speed, base stealing, and first step quickness on the field.",
    image: courseFielding,
    duration: "8 Weeks",
    modules: 5,
    icon: Wind,
    tag: "New",
    metrics: ["10-Yard Sprint", "Home-to-First", "Reaction Time"],
  },
];

const SystemCard = ({ system, index }: { system: typeof trainingSystems[0]; index: number }) => {
  const Icon = system.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-foreground/20 transition-all duration-500 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={system.image}
          alt={system.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-background text-foreground text-xs font-semibold border border-border">
            {system.tag}
          </span>
        </div>

        {/* Icon */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border">
            <Icon className="w-6 h-6 text-foreground" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {system.duration}
          </span>
          <span>{system.modules} Modules</span>
        </div>

        <h3 className="text-xl font-display text-foreground mb-2 group-hover:text-accent transition-colors">
          {system.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {system.description}
        </p>

        {/* Metrics */}
        <div className="flex flex-wrap gap-2 mb-6">
          {system.metrics.map((metric) => (
            <span 
              key={metric}
              className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
            >
              {metric}
            </span>
          ))}
        </div>

        <Button variant="default" className="w-full">
          Learn More
        </Button>
      </div>
    </motion.div>
  );
};

const Courses = () => {
  return (
    <section id="courses" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
            Training Systems
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            DATA-DRIVEN PERFORMANCE
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Five core training systems designed to develop elite baseball athletes 
            through proven, measurable methodologies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainingSystems.map((system, index) => (
            <SystemCard key={system.id} system={system} index={index} />
          ))}
        </div>

        {/* Additional Systems Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <div className="p-6 rounded-2xl border border-border bg-card flex items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Target className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-1">Throwing & Arm Care</h3>
              <p className="text-sm text-muted-foreground">Improve throwing velocity while reducing injury risk</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card flex items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Brain className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-1">Mindset & Psychology</h3>
              <p className="text-sm text-muted-foreground">Mental toughness, confidence, and emotional regulation</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            View All Training Systems
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Courses;
