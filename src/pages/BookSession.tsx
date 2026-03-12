import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CalendarDays, Clock, User, CheckCircle2, ArrowRight,
  Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import { format, addDays, isBefore, startOfDay, isToday } from "date-fns";

const SESSION_TYPES = [
  { value: "private_lesson", label: "Private Lesson", duration: 60, description: "1-on-1 focused development session" },
  { value: "athlete_evaluation", label: "Athlete Evaluation", duration: 45, description: "Full assessment with development plan" },
  { value: "remote_session", label: "Remote Development Session", duration: 45, description: "Virtual coaching via video call" },
];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

const POSITIONS = [
  "RHP", "LHP", "C", "1B", "2B", "SS", "3B", "OF", "DH", "Utility"
];

interface CoachOption {
  user_id: string;
  name: string;
}

type Step = "coach" | "datetime" | "form" | "confirm";

const BookSession = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("coach");
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);

  // Selections
  const [selectedCoach, setSelectedCoach] = useState<CoachOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("private_lesson");

  // Form fields
  const [athleteName, setAthleteName] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [athleteAge, setAthleteAge] = useState("");
  const [position, setPosition] = useState("");

  // State
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [coachAvailability, setCoachAvailability] = useState<any[]>([]);

  useEffect(() => {
    fetchCoaches();
    // Auto-fill logged-in user info
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email || "");
        supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.display_name) setAthleteName(data.display_name);
          });
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCoach && selectedDate) {
      fetchBookedSlots();
      fetchCoachAvailability();
    }
  }, [selectedCoach, selectedDate]);

  const fetchCoaches = async () => {
    const { data } = await supabase
      .from("coaches")
      .select("user_id, name")
      .eq("status", "Active")
      .not("user_id", "is", null);

    setCoaches(data?.map(c => ({ user_id: c.user_id!, name: c.name })) || []);
    setLoadingCoaches(false);
  };

  const fetchBookedSlots = async () => {
    if (!selectedCoach || !selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data } = await supabase
      .from("session_bookings")
      .select("session_time")
      .eq("coach_user_id", selectedCoach.user_id)
      .eq("session_date", dateStr)
      .neq("status", "cancelled");

    setBookedSlots(data?.map(b => b.session_time) || []);
  };

  const fetchCoachAvailability = async () => {
    if (!selectedCoach) return;
    const { data } = await supabase
      .from("coach_availability")
      .select("*")
      .eq("coach_user_id", selectedCoach.user_id)
      .eq("is_active", true);

    setCoachAvailability(data || []);
  };

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();

    // Coach MUST have availability set — no availability = no slots
    const dayAvail = coachAvailability.filter(a => a.day_of_week === dayOfWeek);
    if (dayAvail.length === 0) return [];

    const slots = TIME_SLOTS.filter(slot => {
      const hour24 = convertTo24(slot);
      return dayAvail.some(a => {
        const start = parseInt(a.start_time.split(":")[0]);
        const end = parseInt(a.end_time.split(":")[0]);
        return hour24 >= start && hour24 < end;
      });
    });

    // Filter out already-booked slots and past times for today
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    return slots
      .filter(s => !bookedSlots.includes(s))
      .filter(s => !isToday || convertTo24(s) > now.getHours());
  }, [selectedDate, bookedSlots, coachAvailability]);

  const convertTo24 = (time12: string): number => {
    const [time, period] = time12.split(" ");
    let [hours] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours;
  };

  const handleSubmit = async () => {
    if (!selectedCoach || !selectedDate || !selectedTime || !athleteName || !email) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("session_bookings").insert({
      coach_user_id: selectedCoach.user_id,
      coach_name: selectedCoach.name,
      athlete_name: athleteName,
      parent_name: parentName || null,
      email,
      phone: phone || null,
      athlete_age: athleteAge ? parseInt(athleteAge) : null,
      primary_position: position || null,
      session_type: sessionType,
      session_date: format(selectedDate, "yyyy-MM-dd"),
      session_time: selectedTime,
      duration_minutes: SESSION_TYPES.find(s => s.value === sessionType)?.duration || 60,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      setStep("confirm");
      toast({ title: "Session booked successfully!" });
    }
  };

  const selectedSessionType = SESSION_TYPES.find(s => s.value === sessionType);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-3 block">
              VAULT BASEBALL
            </span>
            <h1 className="text-3xl md:text-5xl font-display text-foreground mb-3">
              BOOK DEVELOPMENT SESSION
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Choose your coach, pick a time, and start developing. Private lessons, evaluations, and remote sessions available.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[
              { key: "coach", label: "Coach" },
              { key: "datetime", label: "Date & Time" },
              { key: "form", label: "Details" },
              { key: "confirm", label: "Confirmed" },
            ].map((s, i) => {
              const steps: Step[] = ["coach", "datetime", "form", "confirm"];
              const currentIdx = steps.indexOf(step);
              const thisIdx = steps.indexOf(s.key as Step);
              const isActive = thisIdx === currentIdx;
              const isDone = thisIdx < currentIdx;

              return (
                <div key={s.key} className="flex items-center gap-2">
                  {i > 0 && <div className={`w-8 h-px ${isDone ? "bg-primary" : "bg-border"}`} />}
                  <div className={`flex items-center gap-1.5 px-3 py-1 text-xs font-display tracking-wider
                    ${isActive ? "bg-foreground text-primary-foreground" : isDone ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : null}
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* STEP 1: Select Coach */}
          {step === "coach" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Session Type Selection */}
              <div>
                <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-4">SESSION TYPE</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {SESSION_TYPES.map(st => (
                    <button
                      key={st.value}
                      onClick={() => setSessionType(st.value)}
                      className={`border p-4 text-left transition-colors
                        ${sessionType === st.value ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"}`}
                    >
                      <p className="text-sm font-display">{st.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{st.description}</p>
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground mt-2">{st.duration} MIN</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coach Selection */}
              <div>
                <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-4">SELECT COACH</h2>
                {loadingCoaches ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : coaches.length === 0 ? (
                  <Card className="border-border"><CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No coaches currently available. Please check back soon.</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {coaches.map(coach => (
                      <button
                        key={coach.user_id}
                        onClick={() => {
                          setSelectedCoach(coach);
                          setStep("datetime");
                        }}
                        className={`border border-border p-5 text-left hover:border-foreground/30 transition-colors group`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-foreground/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-foreground/50" />
                            </div>
                            <div>
                              <p className="font-display text-foreground">{coach.name}</p>
                              <p className="text-xs text-muted-foreground">Vault Coach</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Date & Time */}
          {step === "datetime" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setStep("coach")} className="text-muted-foreground mb-2">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Coach Selection
              </Button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-foreground/10 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-display text-sm">{selectedCoach?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedSessionType?.label} · {selectedSessionType?.duration} min</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-3">SELECT DATE</h2>
                  <Card className="border-border">
                    <CardContent className="p-3">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => { setSelectedDate(date); setSelectedTime(""); }}
                        disabled={(date) => isBefore(date, startOfDay(new Date())) && !isToday(date)}
                        className="pointer-events-auto"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Time Slots */}
                <div>
                  <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-3">
                    {selectedDate ? `AVAILABLE TIMES — ${format(selectedDate, "MMM d")}` : "SELECT A DATE FIRST"}
                  </h2>
                  {selectedDate ? (
                    availableSlots.length === 0 ? (
                      <Card className="border-border"><CardContent className="py-8 text-center">
                        <p className="text-muted-foreground text-sm">No available slots on this date. Try another day.</p>
                      </CardContent></Card>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`border p-3 text-sm font-display transition-colors
                              ${selectedTime === slot
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border hover:border-foreground/20 text-muted-foreground"
                              }`}
                          >
                            <Clock className="w-3 h-3 inline mr-1.5" />
                            {slot}
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <Card className="border-border"><CardContent className="py-8 text-center">
                      <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Pick a date to see available times</p>
                    </CardContent></Card>
                  )}

                  {selectedTime && (
                    <Button
                      className="w-full mt-4 font-display tracking-wide"
                      onClick={() => setStep("form")}
                    >
                      CONTINUE
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Booking Form */}
          {step === "form" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setStep("datetime")} className="text-muted-foreground mb-2">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Date & Time
              </Button>

              {/* Summary */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground">COACH</p>
                      <p className="text-sm font-medium">{selectedCoach?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground">DATE</p>
                      <p className="text-sm font-medium">{selectedDate ? format(selectedDate, "MMM d, yyyy") : ""}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground">TIME</p>
                      <p className="text-sm font-medium">{selectedTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form */}
              <div className="space-y-4">
                <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground">ATHLETE INFORMATION</h2>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Athlete Name *</label>
                  <Input value={athleteName} onChange={e => setAthleteName(e.target.value)} placeholder="Full name" />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Parent / Guardian Name</label>
                  <Input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Parent or guardian name" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                    <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Athlete Age</label>
                    <Input type="number" value={athleteAge} onChange={e => setAthleteAge(e.target.value)} placeholder="14" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Primary Position</label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                className="w-full font-display tracking-wide"
                variant="vault"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting || !athleteName || !email}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                {submitting ? "BOOKING..." : "CONFIRM BOOKING"}
              </Button>
            </motion.div>
          )}

          {/* STEP 4: Confirmation */}
          {step === "confirm" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center space-y-6"
            >
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display text-foreground">SESSION BOOKED!</h2>
              <p className="text-sm text-muted-foreground">
                Your {selectedSessionType?.label.toLowerCase()} with <span className="text-foreground font-medium">{selectedCoach?.name}</span> has been booked for{" "}
                <span className="text-foreground font-medium">{selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}</span> at{" "}
                <span className="text-foreground font-medium">{selectedTime}</span>.
              </p>

              <Card className="border-border">
                <CardContent className="p-4 text-left space-y-2">
                  <h3 className="text-xs font-display tracking-wider text-muted-foreground">WHAT'S NEXT</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Your coach will receive a notification and confirm the session.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>A confirmation with location or meeting link will be sent to <strong>{email}</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Bring athletic clothing and any relevant equipment to your session.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="vault" onClick={() => {
                  setStep("coach");
                  setSelectedCoach(null);
                  setSelectedDate(undefined);
                  setSelectedTime("");
                  setAthleteAge("");
                  setPosition("");
                }}>
                  BOOK ANOTHER SESSION
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  VIEW DASHBOARD
                </Button>
                <Button variant="ghost" onClick={() => navigate("/")}>
                  RETURN HOME
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default BookSession;
