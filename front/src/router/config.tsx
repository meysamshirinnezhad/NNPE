
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Landing from "../pages/landing/page";
import Dashboard from "../pages/dashboard/page";
import RootRedirect from "./RootRedirect";
import About from "../pages/about/page";
import Features from "../pages/features/page";
import Pricing from "../pages/pricing/page";
import Login from "../pages/login/page";
import Signup from "../pages/signup/page";
import Blog from "../pages/blog/page";
import Contact from "../pages/contact/page";
import PrivacyPolicy from "../pages/privacy-policy/page";
import TermsOfService from "../pages/terms-of-service/page";
import Help from "../pages/help/page";
import ForgotPassword from "../pages/forgot-password/page";
import ResetPassword from "../pages/reset-password/page";
import EmailVerification from "../pages/email-verification/page";
import Onboarding from "../pages/onboarding/page";
import Practice from "../pages/practice/page";
import QuestionReview from "../pages/practice/question/page";
import Bookmarks from "../pages/bookmarks/page";
import PracticeTestNew from "../pages/practice-test/new/page";
import PracticeTestTake from "../pages/practice-test/take/page";
import TestResults from "../pages/test/results/page";
import TestReview from "../pages/test/review/page";
import PracticeTests from "../pages/practice-tests/page";
import StudyPath from "../pages/study-path/page";
import ModuleDetail from "../pages/study-path/module/page";
import Topics from "../pages/topics/page";
import TopicDetail from "../pages/topics/detail/page";
import Analytics from "../pages/analytics/page";
import Weaknesses from "../pages/weaknesses/page";
import Forum from "../pages/forum/page";
import ForumPost from "../pages/forum/post/page";
import ForumNew from "../pages/forum/new/page";
import StudyGroups from "../pages/study-groups/page";
import StudyGroupDetail from "../pages/study-groups/detail/page";
import Profile from "../pages/profile/page";
import AccountSettings from "../pages/settings/account/page";
import Subscription from "../pages/settings/subscription/page";
import NotificationSettings from "../pages/settings/notifications/page";
import Achievements from "../pages/achievements/page";
import Support from "../pages/support/page";
import AdminDashboard from "../pages/admin/page";
import AdminUsers from "../pages/admin/users/page";
import AdminQuestions from "../pages/admin/questions/page";
import AdminQuestionEditor from "../pages/admin/questions/editor/page";
import AdminAnalytics from "../pages/admin/analytics/page";
import AdminSubscriptions from "../pages/admin/subscriptions/page";
import Offline from "../pages/offline/page";
import Error from "../pages/error/page";
import Maintenance from "../pages/maintenance/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/landing",
    element: <Landing />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/features",
    element: <Features />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/blog",
    element: <Blog />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/verify-email/:token",
    element: <EmailVerification />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/practice",
    element: <Practice />,
  },
  {
    path: "/practice/:questionId",
    element: <QuestionReview />,
  },
  {
    path: "/bookmarks",
    element: <Bookmarks />,
  },
  {
    path: "/practice-test/new",
    element: <PracticeTestNew />,
  },
  {
    path: "/practice-test/take/:testId",
    element: <PracticeTestTake />,
  },
  {
    path: "/test/:testId/results",
    element: <TestResults />,
  },
  {
    path: "/test/:testId/review",
    element: <TestReview />,
  },
  // Backward-compatible alias routes for query param URLs
  {
    path: "/test/results",
    element: <TestResults />,
  },
  {
    path: "/test/review",
    element: <TestReview />,
  },
  {
    path: "/practice-tests",
    element: <PracticeTests />,
  },
  {
    path: "/study-path",
    element: <StudyPath />,
  },
  {
    path: "/study-path/module/:moduleId",
    element: <ModuleDetail />,
  },
  {
    path: "/topics",
    element: <Topics />,
  },
  {
    path: "/topics/:topicId",
    element: <TopicDetail />,
  },
  {
    path: "/analytics",
    element: <Analytics />,
  },
  {
    path: "/weaknesses",
    element: <Weaknesses />,
  },
  {
    path: "/forum",
    element: <Forum />,
  },
  {
    path: "/forum/post/:postId",
    element: <ForumPost />,
  },
  {
    path: "/forum/new",
    element: <ForumNew />,
  },
  {
    path: "/study-groups",
    element: <StudyGroups />,
  },
  {
    path: "/study-groups/:groupId",
    element: <StudyGroupDetail />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/settings/account",
    element: <AccountSettings />,
  },
  {
    path: "/settings/subscription",
    element: <Subscription />,
  },
  {
    path: "/settings/notifications",
    element: <NotificationSettings />,
  },
  {
    path: "/achievements",
    element: <Achievements />,
  },
  {
    path: "/support",
    element: <Support />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users",
    element: <AdminUsers />,
  },
  {
    path: "/admin/questions",
    element: <AdminQuestions />,
  },
  {
    path: "/admin/questions/new",
    element: <AdminQuestionEditor />,
  },
  {
    path: "/admin/questions/edit/:id",
    element: <AdminQuestionEditor />,
  },
  {
    path: "/admin/analytics",
    element: <AdminAnalytics />,
  },
  {
    path: "/admin/subscriptions",
    element: <AdminSubscriptions />,
  },
  {
    path: "/offline",
    element: <Offline />,
  },
  {
    path: "/error",
    element: <Error />,
  },
  {
    path: "/maintenance",
    element: <Maintenance />,
  },
  {
    path: "/404",
    element: <NotFound />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
