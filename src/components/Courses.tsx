import { motion } from "framer-motion";
import { Clock, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import courseHitting from "@/assets/course-hitting.jpg";
import coursePitching from "@/assets/course-pitching.jpg";
import courseFielding from "@/assets/course-fielding.jpg";

const courses = [
  {
    id: 1,
    title: "Elite Hitting Mechanics",
    description: "Master the fundamentals of a powerful, consistent swing with pro-level techniques.",
    image: courseHitting,
    duration: "8 Hours",
    lessons: 24,
    price: 149,
    rating: 4.9,
    tag: "Best Seller",
  },
  {
    id: 2,
    title: "Pitching Mastery",
    description: "Develop devastating velocity and pinpoint control with advanced pitching mechanics.",
    image: coursePitching,
    duration: "10 Hours",
    lessons: 32,
    price: 199,
    rating: 4.8,
    tag: "Popular",
  },
  {
    id: 3,
    title: "Defensive Excellence",
    description: "Become a lockdown defender with elite fielding, footwork, and throwing mechanics.",
    image: courseFielding,
    duration: "6 Hours",
    lessons: 18,
    price: 129,
    rating: 4.9,
    tag: "New",
  },
];

const CourseCard = ({ course, index }: { course: typeof courses[0]; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {course.tag}
          </span>
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <PlayCircle className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </span>
          <span>{course.lessons} Lessons</span>
          <span className="flex items-center gap-1 text-primary">
            <Star className="w-4 h-4 fill-primary" />
            {course.rating}
          </span>
        </div>

        <h3 className="text-xl font-display text-foreground mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display text-foreground">${course.price}</span>
            <span className="text-muted-foreground text-sm">USD</span>
          </div>
          <Button variant="default" size="sm">
            Enroll Now
          </Button>
        </div>
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
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            Training Programs
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            MASTER EVERY ASPECT
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Comprehensive courses designed by professional players and coaches
            to take your game to the next level.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            View All Courses
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Courses;
