import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Flame } from "lucide-react";

interface BetaUrgencyBannerProps {
  accentColor?: "amber" | "purple";
  spotsTotal?: number;
  spotsClaimed?: number;
  endDate?: Date;
}

const BetaUrgencyBanner = ({ 
  accentColor = "amber",
  spotsTotal = 100,
  spotsClaimed = 73,
  endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
}: BetaUrgencyBannerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const spotsRemaining = spotsTotal - spotsClaimed;
  const percentageClaimed = (spotsClaimed / spotsTotal) * 100;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - Date.now();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const colorClasses = {
    amber: {
      bg: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-500/30",
      text: "text-amber-500",
      progressBg: "bg-amber-500/20",
      progressFill: "bg-amber-500",
      glow: "shadow-amber-500/20",
    },
    purple: {
      bg: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-500/30",
      text: "text-purple-500",
      progressBg: "bg-purple-500/20",
      progressFill: "bg-purple-500",
      glow: "shadow-purple-500/20",
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-2xl p-6 mb-12`}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Countdown Timer */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className={`w-4 h-4 ${colors.text}`} />
            <span className="text-sm font-medium text-foreground">Beta Pricing Ends In</span>
          </div>
          <div className="flex gap-3">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hrs" },
              { value: timeLeft.minutes, label: "Min" },
              { value: timeLeft.seconds, label: "Sec" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`bg-background border border-border rounded-lg px-3 py-2 min-w-[50px] shadow-lg ${colors.glow}`}>
                  <span className={`text-2xl font-display ${colors.text}`}>
                    {String(item.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spots Remaining */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className={`w-4 h-4 ${colors.text}`} />
            <span className="text-sm font-medium text-foreground">Beta Spots Available</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${colors.text} animate-pulse`} />
                <span className={`text-2xl font-display ${colors.text}`}>{spotsRemaining}</span>
                <span className="text-muted-foreground text-sm">spots left</span>
              </div>
              <span className="text-xs text-muted-foreground">{spotsClaimed} of {spotsTotal} claimed</span>
            </div>
            <div className={`h-2 ${colors.progressBg} rounded-full overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentageClaimed}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full ${colors.progressFill} rounded-full`}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {percentageClaimed >= 75 
                ? "🔥 Almost sold out! Don't miss beta pricing." 
                : percentageClaimed >= 50 
                  ? "⚡ Going fast! Lock in your beta access now."
                  : "✨ Early bird pricing available for first 100 members."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BetaUrgencyBanner;