import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpcomingTryout } from "@/hooks/useUpcomingTryout";

const UpcomingTryoutCTA = () => {
  const { tryout } = useUpcomingTryout(30);
  const navigate = useNavigate();

  if (!tryout) return null;

  const eventDate = new Date(tryout.starts_at);
  const dateLabel = eventDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-5xl"
      >
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                  Tryouts Open
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-1">
                  {tryout.name}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>📅 {dateLabel}</span>
                  {tryout.age_group && <span>👥 Ages {tryout.age_group}</span>}
                  {tryout.location_name && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {tryout.location_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(`/tryouts/${tryout.id}/register`)}
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Register Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default UpcomingTryoutCTA;
