import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { FoundersPricingBanner } from "@/components/FoundersPricingBanner";
import TrialProtectedRoute from "@/components/TrialProtectedRoute";
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
import AthleteAssessment from "./pages/products/AthleteAssessment";
import RemoteTraining from "./pages/products/RemoteTraining";
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
import { EddieAIChat } from "@/components/EddieAIChat";
import DeviceMetrics from "./pages/DeviceMetrics";
import SharedMetricsView from "./pages/SharedMetricsView";
import Trial from "./pages/Trial";
import VelocityBaseline from "./pages/VelocityBaseline";
import TrialExpired from "./pages/TrialExpired";
import WhitePaper from "./pages/WhitePaper";
import BaselineAudit from "./pages/BaselineAudit";
import PerformanceBlueprint from "./pages/PerformanceBlueprint";
import CoachRegister from "./pages/CoachRegister";
import CoachOnboarding from "./pages/CoachOnboarding";
import LessonPackages from "./pages/LessonPackages";
import RemoteLessons from "./pages/RemoteLessons";
import GroupSessions from "./pages/GroupSessions";
import FreeVelocityGuide from "./pages/FreeVelocityGuide";
import FreeEvaluation from "./pages/FreeEvaluation";
import AthleteOnboarding from "./pages/AthleteOnboarding";
import RemoteTrainingHub from "./pages/RemoteTrainingHub";
import Marketplace from "./pages/Marketplace";
import CoachMarketplaceProfile from "./pages/CoachMarketplaceProfile";
import Claim22MAccess from "./pages/Claim22MAccess";
import ShortRedirect from "./pages/ShortRedirect";
import CoachManagement from "./pages/CoachManagement";
import OwnerCommandCenter from "./pages/OwnerCommandCenter";
import ProgressReport from "./pages/ProgressReport";
import BookSession from "./pages/BookSession";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Site-wide Founder's Pricing Urgency Banner */}
          <FoundersPricingBanner />
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/checkin" element={<Checkin />} />
            
            {/* Protected app routes with trial check */}
            <Route path="/dashboard" element={
              <TrialProtectedRoute>
                <Dashboard />
              </TrialProtectedRoute>
            } />
            <Route path="/vault" element={
              <TrialProtectedRoute>
                <VaultDashboard />
              </TrialProtectedRoute>
            } />
            <Route path="/coach" element={<CoachDashboard />} />
            <Route path="/owner" element={<OwnerCommandCenter />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/certification-analytics" element={<CertificationAnalytics />} />
            <Route path="/admin/coaches" element={<AdminCoaches />} />
            <Route path="/admin/exams" element={<AdminExams />} />
            <Route path="/admin/certifications" element={<AdminCertifications />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
            <Route path="/admin/coach-management" element={<CoachManagement />} />
            <Route path="/community" element={
              <TrialProtectedRoute>
                <Community />
              </TrialProtectedRoute>
            } />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CoursesRedirect />} />
            <Route path="/course/:courseId" element={
              <TrialProtectedRoute>
                <CourseDetail />
              </TrialProtectedRoute>
            } />
            <Route path="/my-programs" element={
              <TrialProtectedRoute>
                <MyPrograms />
              </TrialProtectedRoute>
            } />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pathway/youth" element={<YouthPathway />} />
            <Route path="/pathway/academy" element={<AcademyPathway />} />
            <Route path="/longevity" element={
              <TrialProtectedRoute>
                <LongevityDashboard />
              </TrialProtectedRoute>
            } />
            <Route path="/calendar" element={
              <TrialProtectedRoute>
                <WeeklyCalendar />
              </TrialProtectedRoute>
            } />
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
            <Route path="/products/remote-training" element={<RemoteTraining />} />
            <Route path="/products/founders-access" element={<FoundersAccess />} />
            <Route path="/products/athlete-assessment" element={<AthleteAssessment />} />
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
            <Route path="/device-metrics" element={
              <TrialProtectedRoute allowTrialAccess>
                <DeviceMetrics />
              </TrialProtectedRoute>
            } />
            <Route path="/shared-metrics/:token" element={<SharedMetricsView />} />
            
            {/* Trial System Routes */}
            <Route path="/trial" element={<Trial />} />
            <Route path="/velocity-baseline" element={
              <TrialProtectedRoute allowTrialAccess>
                <VelocityBaseline />
              </TrialProtectedRoute>
            } />
            <Route path="/trial-expired" element={<TrialExpired />} />
            <Route path="/white-paper" element={<WhitePaper />} />
            <Route path="/baseline-audit" element={<BaselineAudit />} />
            <Route path="/performance-blueprint" element={<PerformanceBlueprint />} />
            <Route path="/coach-register" element={<CoachRegister />} />
            <Route path="/coach-onboarding" element={<CoachOnboarding />} />
            <Route path="/lesson-packages" element={<LessonPackages />} />
            <Route path="/remote-lessons" element={<RemoteLessons />} />
            <Route path="/group-sessions" element={<GroupSessions />} />
            <Route path="/free-velocity-guide" element={<FreeVelocityGuide />} />
            <Route path="/athlete-onboarding" element={<AthleteOnboarding />} />
            <Route path="/evaluate" element={<FreeEvaluation />} />
            <Route path="/training-hub" element={<RemoteTrainingHub />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/coach/:coachId" element={<CoachMarketplaceProfile />} />
            <Route path="/progress-report/:token" element={<ProgressReport />} />
            <Route path="/book-session" element={<BookSession />} />
            <Route path="/claim-22m" element={<Claim22MAccess />} />
            
            {/* Short URL redirects for social sharing */}
            <Route path="/app" element={<ShortRedirect />} />
            <Route path="/training" element={<ShortRedirect />} />
            <Route path="/start" element={<ShortRedirect />} />
            <Route path="/22m" element={<ShortRedirect />} />
            <Route path="/coaching" element={<ShortRedirect />} />
            <Route path="/join" element={<ShortRedirect />} />
            <Route path="/programs" element={<ShortRedirect />} />
            <Route path="/velocity" element={<ShortRedirect />} />
            <Route path="/founders" element={<ShortRedirect />} />
            <Route path="/guide" element={<ShortRedirect />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
          <EddieAIChat />
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;
