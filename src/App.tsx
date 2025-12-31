import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Schedule from "./pages/Schedule";
import Checkin from "./pages/Checkin";
import Dashboard from "./pages/Dashboard";
import VaultDashboard from "./pages/VaultDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import Admin from "./pages/Admin";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import MyPrograms from "./pages/MyPrograms";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import YouthPathway from "./pages/YouthPathway";
import AcademyPathway from "./pages/AcademyPathway";
import LongevityDashboard from "./pages/LongevityDashboard";
import WeeklyCalendar from "./pages/WeeklyCalendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/checkin" element={<Checkin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vault" element={<VaultDashboard />} />
            <Route path="/coach" element={<CoachDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/my-programs" element={<MyPrograms />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pathway/youth" element={<YouthPathway />} />
            <Route path="/pathway/academy" element={<AcademyPathway />} />
            <Route path="/longevity" element={<LongevityDashboard />} />
            <Route path="/calendar" element={<WeeklyCalendar />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;
