import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SportProvider } from "@/contexts/SportContext";
import { FoundersPricingBanner } from "@/components/FoundersPricingBanner";
import SessionExpiryHandler from "@/components/auth/SessionExpiryHandler";
import TrialProtectedRoute from "@/components/TrialProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import Schedule from "./pages/Schedule";
import Checkin from "./pages/Checkin";
import Dashboard from "./pages/Dashboard";
import VaultDashboard from "./pages/VaultDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import CoachDashboardLayout from "./components/coach/CoachDashboardLayout";
import CoachAthletes from "./pages/coach/CoachAthletes";
import CoachKPIs from "./pages/coach/CoachKPIs";
import CoachLessons from "./pages/coach/CoachLessons";
import CoachAssignments from "./pages/coach/CoachAssignments";
import CoachCreate from "./pages/coach/CoachCreate";
import CoachSchedule from "./pages/coach/CoachSchedule";
import CoachProfilePage from "./pages/coach/CoachProfile";
import Admin from "./pages/Admin";
import OwnerDashboardLayout from "./components/admin/OwnerDashboardLayout";
import OwnerOverview from "./pages/admin/OwnerOverview";
import OwnerRevenue from "./pages/admin/OwnerRevenue";
import OwnerUsers from "./pages/admin/OwnerUsers";
import OwnerContentQueue from "./pages/admin/OwnerContentQueue";
import OwnerContent from "./pages/admin/OwnerContent";
import OwnerIntelligence from "./pages/admin/OwnerIntelligence";
import OwnerSettings from "./pages/admin/OwnerSettings";
import OwnerMaintenance from "./pages/admin/OwnerMaintenance";
import OwnerAnalytics from "./pages/admin/OwnerAnalytics";
import OwnerHealthMetrics from "./pages/admin/OwnerHealthMetrics";
import OwnerAudit from "./pages/admin/OwnerAudit";
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
import VideoExam from "./pages/VideoExam";
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
import LongevitySystem from "./pages/products/LongevitySystem";
import TransferSystem from "./pages/products/TransferSystem";
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
import DeviceIngestionPage from "./pages/DeviceIngestion";
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
import SoftballDevelopment from "./pages/SoftballDevelopment";
import SoftballLessonBooking from "./pages/softball/SoftballLessonBooking";
import SoftballCoaches from "./pages/softball/SoftballCoaches";
import SoftballLessonNotes from "./pages/softball/SoftballLessonNotes";
import SoftballCourses from "./pages/softball/SoftballCourses";
import SoftballProfile from "./pages/softball/SoftballProfile";
import SoftballPitching from "./pages/softball/SoftballPitching";
import SoftballHitting from "./pages/softball/SoftballHitting";
import SoftballFielding from "./pages/softball/SoftballFielding";
import SoftballAnalytics from "./pages/softball/SoftballAnalytics";
import SoftballPositionTracks from "./pages/softball/SoftballPositionTracks";
import RecruitingHub from "./pages/recruiting/RecruitingHub";
import RecruitingProfilePage from "./pages/recruiting/RecruitingProfile";
import RecruitingShowcases from "./pages/recruiting/RecruitingShowcases";
import RecruitingContacts from "./pages/recruiting/RecruitingContacts";
import RecruitingChecklist from "./pages/recruiting/RecruitingChecklist";
import RecruitingAssistantPage from "./pages/recruiting/RecruitingAssistantPage";
import ParentDashboardLayout from "./components/parent/ParentDashboardLayout";
import ParentAthletes from "./pages/parent/ParentAthletes";
import ParentProgress from "./pages/parent/ParentProgress";
import ParentLessons from "./pages/parent/ParentLessons";
import ParentRecruiting from "./pages/parent/ParentRecruiting";
import ParentWellness from "./pages/parent/ParentWellness";
import ParentTraining from "./pages/parent/ParentTraining";
import ParentMessages from "./pages/parent/ParentMessages";
import ParentDownloads from "./pages/parent/ParentDownloads";
import AthleteDownloads from "./pages/AthleteDownloads";
import CoachDownloads from "./pages/coach/CoachDownloads";
import OwnerExports from "./pages/admin/OwnerExports";
import WorkloadDashboard from "./pages/workload/WorkloadDashboard";
import PitchLog from "./pages/workload/PitchLog";
import ArmCare from "./pages/workload/ArmCare";
import InjuryLog from "./pages/workload/InjuryLog";
import DailyWorkloadLog from "./pages/workload/DailyWorkloadLog";
import TournamentMode from "./pages/workload/TournamentMode";
import TeamHub from "./pages/team/TeamHub";
import TeamRoster from "./pages/team/TeamRoster";
import TeamSchedule from "./pages/team/TeamSchedule";
import TeamAnnouncements from "./pages/team/TeamAnnouncements";
import TeamAnalytics from "./pages/team/TeamAnalytics";
import MentalPerformance from "./pages/MentalPerformance";
import StrengthConditioning from "./pages/StrengthConditioning";
import PracticePlanBuilder from "./pages/team/PracticePlanBuilder";
import DPFlexBuilder from "./pages/softball/DPFlexBuilder";
import ResetPassword from "./pages/ResetPassword";

// Redirect /courses/:id to /course/:id
const CoursesRedirect = () => {
  const courseId = window.location.pathname.split('/courses/')[1];
  return <Navigate to={`/course/${courseId}`} replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <SportProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Site-wide Founder's Pricing Urgency Banner */}
          <FoundersPricingBanner />
          <SessionExpiryHandler />
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/account" element={<Account />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/checkin" element={<Checkin />} />
            
            {/* Protected app routes with trial check */}
            <Route path="/dashboard" element={
              <TrialProtectedRoute>
                <Dashboard />
              </TrialProtectedRoute>
            } />
            <Route path="/downloads" element={
              <TrialProtectedRoute><AthleteDownloads /></TrialProtectedRoute>
            } />
            <Route path="/vault" element={
              <TrialProtectedRoute>
                <VaultDashboard />
              </TrialProtectedRoute>
            } />
            {/* Coach Dashboard — nested layout with sidebar */}
            <Route path="/coach" element={
              <RoleGuard requiresRole={["coach", "owner"]}><CoachDashboardLayout /></RoleGuard>
            }>
              <Route index element={<CoachAthletes />} />
              <Route path="kpis" element={<CoachKPIs />} />
              <Route path="lessons" element={<CoachLessons />} />
              <Route path="assignments" element={<CoachAssignments />} />
              <Route path="create" element={<CoachCreate />} />
              <Route path="schedule" element={<CoachSchedule />} />
              <Route path="profile" element={<CoachProfilePage />} />
              <Route path="downloads" element={<CoachDownloads />} />
            </Route>
            <Route path="/coach-dashboard" element={
              <RoleGuard requiresRole={["coach", "owner"]}><CoachDashboard /></RoleGuard>
            } />
            <Route path="/owner" element={
              <RoleGuard requires="view_revenue_dashboard"><OwnerCommandCenter /></RoleGuard>
            } />
            {/* Owner Dashboard — nested layout with sidebar */}
            <Route path="/admin" element={
              <RoleGuard requires="view_platform_settings"><OwnerDashboardLayout /></RoleGuard>
            }>
              <Route index element={<OwnerOverview />} />
              <Route path="revenue" element={
                <RoleGuard requires="view_revenue_dashboard"><OwnerRevenue /></RoleGuard>
              } />
              <Route path="users" element={
                <RoleGuard requires="view_all_users"><OwnerUsers /></RoleGuard>
              } />
              <Route path="content/queue" element={
                <RoleGuard requires="approve_content"><OwnerContentQueue /></RoleGuard>
              } />
              <Route path="content" element={
                <RoleGuard requires="approve_content"><OwnerContent /></RoleGuard>
              } />
              <Route path="intelligence" element={
                <RoleGuard requires="view_intelligence_rules"><OwnerIntelligence /></RoleGuard>
              } />
              <Route path="settings" element={
                <RoleGuard requires="view_platform_settings"><OwnerSettings /></RoleGuard>
              } />
              <Route path="analytics" element={
                <RoleGuard requires="view_platform_analytics"><OwnerAnalytics /></RoleGuard>
              } />
              <Route path="health" element={
                <RoleGuard requires="view_platform_analytics"><OwnerHealthMetrics /></RoleGuard>
              } />
              <Route path="maintenance" element={
                <RoleGuard requires="view_platform_settings"><OwnerMaintenance /></RoleGuard>
              } />
              <Route path="audit" element={
                <RoleGuard requires="view_audit_log"><OwnerAudit /></RoleGuard>
              } />
              {/* Legacy sub-routes */}
              <Route path="certification-analytics" element={
                <RoleGuard requires="view_platform_analytics"><CertificationAnalytics /></RoleGuard>
              } />
              <Route path="coaches" element={
                <RoleGuard requires="view_all_users"><AdminCoaches /></RoleGuard>
              } />
              <Route path="exams" element={
                <RoleGuard requires="view_platform_settings"><AdminExams /></RoleGuard>
              } />
              <Route path="certifications" element={
                <RoleGuard requires="view_platform_settings"><AdminCertifications /></RoleGuard>
              } />
              <Route path="payouts" element={
                <RoleGuard requires="process_payouts"><AdminPayouts /></RoleGuard>
              } />
              <Route path="coach-management" element={
                <RoleGuard requires="view_all_users"><CoachManagement /></RoleGuard>
              } />
              <Route path="exports" element={
                <RoleGuard requires="view_revenue_dashboard"><OwnerExports /></RoleGuard>
              } />
            </Route>
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
            <Route path="/certifications/video-exam/:certType" element={<VideoExam />} />
            <Route path="/certifications/leaderboard" element={<CertificationLeaderboard />} />
            <Route path="/verify" element={<VerifyCertification />} />
            <Route path="/privacy-settings" element={<PrivacySettings />} />
            {/* Payment Pages */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            {/* Product Pages */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/longevity" element={<LongevitySystem />} />
            <Route path="/products/transfer" element={<TransferSystem />} />
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
            <Route path="/data-ingestion" element={<TrialProtectedRoute><DeviceIngestionPage /></TrialProtectedRoute>} />
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
            
            {/* Softball Development */}
            <Route path="/softball" element={
              <TrialProtectedRoute>
                <SoftballDevelopment />
              </TrialProtectedRoute>
            } />
            <Route path="/softball/lessons/booking" element={<SoftballLessonBooking />} />
            <Route path="/softball/lessons/coaches" element={<SoftballCoaches />} />
            <Route path="/softball/lessons/notes" element={<SoftballLessonNotes />} />
            <Route path="/softball/courses" element={<SoftballCourses />} />
            <Route path="/softball/profile" element={<SoftballProfile />} />
            <Route path="/softball/pitching" element={<SoftballPitching />} />
            <Route path="/softball/hitting" element={<SoftballHitting />} />
            <Route path="/softball/fielding" element={<SoftballFielding />} />
            <Route path="/softball/analytics" element={<SoftballAnalytics />} />
            <Route path="/softball/position-tracks" element={<SoftballPositionTracks />} />
            
            {/* Recruiting Readiness Engine */}
            <Route path="/recruiting" element={
              <TrialProtectedRoute><RecruitingHub /></TrialProtectedRoute>
            } />
            <Route path="/recruiting/profile" element={
              <TrialProtectedRoute><RecruitingProfilePage /></TrialProtectedRoute>
            } />
            <Route path="/recruiting/showcases" element={
              <TrialProtectedRoute><RecruitingShowcases /></TrialProtectedRoute>
            } />
            <Route path="/recruiting/contacts" element={
              <TrialProtectedRoute><RecruitingContacts /></TrialProtectedRoute>
            } />
            <Route path="/recruiting/checklist" element={
              <TrialProtectedRoute><RecruitingChecklist /></TrialProtectedRoute>
            } />
            <Route path="/recruiting/assistant" element={
              <TrialProtectedRoute><RecruitingAssistantPage /></TrialProtectedRoute>
            } />
            
            {/* Parent Portal — nested layout with sidebar */}
            <Route path="/parent" element={
              <RoleGuard requiresRole={["parent", "athlete", "owner"]}><ParentDashboardLayout /></RoleGuard>
            }>
              <Route index element={<ParentAthletes />} />
              <Route path="progress" element={<ParentProgress />} />
              <Route path="lessons" element={<ParentLessons />} />
              <Route path="training" element={<ParentTraining />} />
              <Route path="wellness" element={<ParentWellness />} />
              <Route path="recruiting" element={<ParentRecruiting />} />
              <Route path="messages" element={<ParentMessages />} />
              <Route path="downloads" element={<ParentDownloads />} />
            </Route>


            {/* Workload & Health Management */}
            <Route path="/workload" element={<TrialProtectedRoute><WorkloadDashboard /></TrialProtectedRoute>} />
            <Route path="/workload/pitch-log" element={<TrialProtectedRoute><PitchLog /></TrialProtectedRoute>} />
            <Route path="/workload/arm-care" element={<TrialProtectedRoute><ArmCare /></TrialProtectedRoute>} />
            <Route path="/workload/injuries" element={<TrialProtectedRoute><InjuryLog /></TrialProtectedRoute>} />
            <Route path="/workload/daily-log" element={<TrialProtectedRoute><DailyWorkloadLog /></TrialProtectedRoute>} />
            <Route path="/workload/tournament" element={<TrialProtectedRoute><TournamentMode /></TrialProtectedRoute>} />

            {/* Team Management */}
            <Route path="/team" element={<TrialProtectedRoute><TeamHub /></TrialProtectedRoute>} />
            <Route path="/team/roster" element={<TrialProtectedRoute><TeamRoster /></TrialProtectedRoute>} />
            <Route path="/team/schedule" element={<TrialProtectedRoute><TeamSchedule /></TrialProtectedRoute>} />
            <Route path="/team/announcements" element={<TrialProtectedRoute><TeamAnnouncements /></TrialProtectedRoute>} />
            <Route path="/team/analytics" element={<TrialProtectedRoute><TeamAnalytics /></TrialProtectedRoute>} />
            <Route path="/team/practice-plans" element={<RoleGuard requiresRole={["coach", "owner"]}><PracticePlanBuilder /></RoleGuard>} />

            {/* Mental Performance & S&C */}
            <Route path="/mental-performance" element={<TrialProtectedRoute><MentalPerformance /></TrialProtectedRoute>} />
            <Route path="/strength-conditioning" element={<TrialProtectedRoute><StrengthConditioning /></TrialProtectedRoute>} />

            {/* Softball DP/Flex */}
            <Route path="/softball/dp-flex" element={<RoleGuard requiresRole={["coach", "owner"]}><DPFlexBuilder /></RoleGuard>} />

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
      </SportProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;
