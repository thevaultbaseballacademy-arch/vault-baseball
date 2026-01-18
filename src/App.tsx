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
import Certifications from "./pages/Certifications";
import CertificationExam from "./pages/CertificationExam";
import VerifyCertification from "./pages/VerifyCertification";
import CertificationLeaderboard from "./pages/CertificationLeaderboard";
import PrivacySettings from "./pages/PrivacySettings";
import CertificationAnalytics from "./pages/admin/CertificationAnalytics";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminExams from "./pages/admin/AdminExams";
import AdminCertifications from "./pages/admin/AdminCertifications";
import AdminPayouts from "./pages/admin/AdminPayouts";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import LongevityBeta from "./pages/products/LongevityBeta";
import TransferBeta from "./pages/products/TransferBeta";
import VelocitySystem from "./pages/products/VelocitySystem";
import VelocityAccelerator from "./pages/products/VelocityAccelerator";
import TeamLicenses from "./pages/products/TeamLicenses";
import VeloCheck from "./pages/products/VeloCheck";
import Bundles from "./pages/products/Bundles";
import RecruitmentAudit from "./pages/products/RecruitmentAudit";
import CertifiedCoach from "./pages/products/CertifiedCoach";
import TransferIntensive from "./pages/products/TransferIntensive";
import VaultVerifiedCoach from "./pages/products/VaultVerifiedCoach";
import ShowcasePrep from "./pages/products/ShowcasePrep";
import VideoAnalysis from "./pages/products/VideoAnalysis";
import OrgStarterPack from "./pages/products/OrgStarterPack";
import FoundersAccess from "./pages/products/FoundersAccess";
import PartnerClaim from "./pages/PartnerClaim";
import WallOfWins from "./pages/WallOfWins";
import Products from "./pages/Products";
import FindCoach from "./pages/FindCoach";
import SharedProfile from "./pages/SharedProfile";
import VerifyCourseCertificate from "./pages/VerifyCourseCertificate";
import CertificateLeaderboard from "./pages/CertificateLeaderboard";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import AthleteWaiver from "./pages/AthleteWaiver";
import CookieSettings from "./pages/CookieSettings";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import { CookieConsent } from "@/components/CookieConsent";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import DeviceMetrics from "./pages/DeviceMetrics";
import SharedMetricsView from "./pages/SharedMetricsView";

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
            <Route path="/admin/certification-analytics" element={<CertificationAnalytics />} />
            <Route path="/admin/coaches" element={<AdminCoaches />} />
            <Route path="/admin/exams" element={<AdminExams />} />
            <Route path="/admin/certifications" element={<AdminCertifications />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
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
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/certifications/exam/:certType" element={<CertificationExam />} />
            <Route path="/certifications/leaderboard" element={<CertificationLeaderboard />} />
            <Route path="/verify" element={<VerifyCertification />} />
            <Route path="/privacy-settings" element={<PrivacySettings />} />
            {/* Payment Pages */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            {/* Product Pages */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/longevity" element={<LongevityBeta />} />
            <Route path="/products/transfer" element={<TransferBeta />} />
            <Route path="/products/velocity-system" element={<VelocitySystem />} />
            <Route path="/products/velocity-accelerator" element={<VelocityAccelerator />} />
            <Route path="/products/teams" element={<TeamLicenses />} />
            <Route path="/products/velo-check" element={<VeloCheck />} />
            <Route path="/products/bundles" element={<Bundles />} />
            <Route path="/products/recruitment" element={<RecruitmentAudit />} />
            <Route path="/products/certified-coach" element={<CertifiedCoach />} />
            <Route path="/products/transfer-intensive" element={<TransferIntensive />} />
            <Route path="/products/vault-verified" element={<VaultVerifiedCoach />} />
            <Route path="/products/showcase-prep" element={<ShowcasePrep />} />
            <Route path="/products/video-analysis" element={<VideoAnalysis />} />
            <Route path="/products/org-starter-pack" element={<OrgStarterPack />} />
            <Route path="/products/founders-access" element={<FoundersAccess />} />
            <Route path="/partner-claim" element={<PartnerClaim />} />
            <Route path="/wall-of-wins" element={<WallOfWins />} />
            <Route path="/find-coach" element={<FindCoach />} />
            <Route path="/shared/:token" element={<SharedProfile />} />
            <Route path="/verify-course-certificate" element={<VerifyCourseCertificate />} />
            <Route path="/certificate-leaderboard" element={<CertificateLeaderboard />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refunds" element={<RefundPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/athlete-waiver" element={<AthleteWaiver />} />
            <Route path="/cookie-settings" element={<CookieSettings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/device-metrics" element={<DeviceMetrics />} />
            <Route path="/shared-metrics/:token" element={<SharedMetricsView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
          <FloatingChatWidget />
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;
