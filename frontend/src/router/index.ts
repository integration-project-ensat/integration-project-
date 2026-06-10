import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import ForgetPasswordView from "@/views/ForgetPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import VerifyCodeView from "../views/VerifyCodeView.vue";
import WelcomeView from "../views/WelcomeView.vue";
import StudentProfileView from "../views/StudentProfileView.vue";
import ExploreView from "../views/ExploreView.vue";
import ExploreProfView from "../views/ExploreProfView.vue";
import ExploreProView from "../views/ExploreProView.vue";
import OAuthSuccessView from "../views/OAuthSuccessView.vue";
import CompleteProfileView from "../views/CompleteProfileView.vue";
import AdminDashboardView from "../views/AdminDashboardView.vue";
import AdminProfilesView from "../views/AdminProfilesView.vue";
import AdminPortfoliosView from "../views/AdminPortfoliosView.vue";
import AdminActivitiesView from "../views/AdminActivitiesView.vue";
import AdminProjetsView from "../views/AdminProjetsView.vue";
import AdminCertificationsView from "../views/AdminCertificationsView.vue";
import DashboardView from "../views/DashboardView.vue";
import DashboardProfView from "../views/DashboardProfView.vue";
import DashboardProView from "../views/DashboardProView.vue";
import DashboardStudentView from "../views/DashboardStudentView.vue";
import StudentAIRecommendationView from "../views/StudentAIRecommendationView.vue";
import LettersView from "../views/LettersView.vue";
import ProjectsView from "../views/ProjectsView.vue";
import StagesView from "../views/StagesView.vue";
import CertificationsView from "../views/CertificationsView.vue";
import ActivitesView from "../views/ActivitesView.vue";
import StudentRecommendationsView from "../views/StudentRecommendationsView.vue";
import StudentCommentsView from "../views/StudentCommentsView.vue";
import StudentGithubView from "../views/StudentGithubView.vue";
import SettingsView from "../views/SettingsView.vue";
import SettingsProfessionalView from "../views/SettingsProfessionalView.vue";
import SettingsProfessorView from "../views/SettingsProfessorView.vue";
import StudentPortfolioView from "../views/StudentPortfolioView.vue";
//import ConnexionsProView from "../views/ConnexionsProView.vue";
//import FeedProjectDetailsView from "../views/FeedProjectDetailsView.vue";
import FeedView from "../views/FeedView.vue";
import FeedProjectDetailsView from "../views/FeedProjectDetailsView.vue";
import ConnexionsProView from "../views/ConnexionsProView.vue";
import TopProfilesProView from "../views/TopProfilesProView.vue";
import ValidationProfView from "../views/ValidationProfView.vue";
import RecommandationsProfView from "../views/RecommandationsProfView.vue";
import EtudiantsProfView from "../views/EtudiantsProfView.vue";
import ProfileEditView from "../views/ProfileEditView.vue";
import AIPortfolioAnalyzerView from "../views/AIPortfolioAnalyzerView.vue";
import PortfolioCreativeView from "../views/PortfolioCreativeView.vue";
import PortfolioProfessionalView from "../views/PortfolioProfessionalView.vue";
const Placeholder = {
  template: '<div style="padding:2rem">Page en construction</div>',
};

const legacyProfileTargets: Record<string, string> = {
  "student-1": "/profile/student/7",
  "student-2": "/profile/student/8",
  "student-3": "/profile/student/9",
  "student-4": "/profile/student/11",
  "khadija-bennani": "/profile/student/7",
  "yassine-el-amrani": "/profile/student/11",
  "mehdi-berrada": "/profile/student/9",
  "hajar-mansouri": "/profile/student/10",
  "amine-lahlou": "/profile/student/8",
  "sara-alaoui": "/profile/student/10",
  "prof-1": "/profile/user/4",
  "prof-2": "/profile/user/5",
  "professional-1": "/profile/user/12",
  "professional-2": "/profile/user/13",
  "professional-3": "/profile/user/14",
};

const appendQuery = (path: string, query: string) =>
  query ? `${path}?${query}` : path;

const serializeQuery = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry != null) params.append(key, String(entry));
      });
      return;
    }
    params.append(key, String(value));
  });

  return params.toString();
};

const resolveLegacyProfileTarget = (
  key: string,
  query: Record<string, unknown> = {},
) => {
  const normalizedKey = String(key ?? "")
    .trim()
    .toLowerCase();
  const target = legacyProfileTargets[normalizedKey] ?? "/profile";
  return appendQuery(target, serializeQuery(query));
};

const redirectByRole = () => {
  const role = localStorage.getItem("role");
  if (role === "student") return "/student/dashboard";
  if (role === "teacher") return "/prof/dashboard";
  if (role === "professional") return "/pro/dashboard";
  if (role === "admin") return "/admin";
  return "/login";
};

const redirectExploreByRole = () => {
  const role = localStorage.getItem("role");
  if (role === "teacher") return "/explore-prof";
  if (role === "professional") return "/explore-pro";
  if (role === "student") return "/student/explore";
  return "/login";
};

const redirectSettingsByRole = () => {
  const role = localStorage.getItem("role");
  if (role === "teacher") return "/prof/settings";
  if (role === "professional") return "/pro/settings";
  if (role === "student") return "/student/settings";
  return "/login";
};

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/", name: "welcome", component: WelcomeView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/signup", name: "signup", component: SignupView },
    {
      path: "/oauth-success",
      name: "oauth-success",
      component: OAuthSuccessView,
    },
    {
      path: "/complete-profile",
      name: "complete-profile",
      component: CompleteProfileView,
    },
    { path: "/forgot", name: "forgot", component: ForgetPasswordView },
    { path: "/reset-password", name: "reset", component: ResetPasswordView },
    { path: "/verify-code", name: "verify-code", component: VerifyCodeView },
    {
      path: "/oauth-success",
      name: "oauth-success",
      component: OAuthSuccessView,
    },
    {
      path: "/complete-profile",
      name: "complete-profile",
      component: CompleteProfileView,
    },
    { path: "/explore", name: "explore", component: ExploreView },
    { path: "/explore-prof", name: "explore-prof", component: ExploreProfView },
    { path: "/explore-pro", name: "explore-pro", component: ExploreProView },
    {
      path: "/dashboard",
      name: "dashboard",
      redirect: () => {
        const role = localStorage.getItem("role");
        if (role === "student") return "/student/dashboard";
        if (role === "teacher") return "/prof/dashboard";
        if (role === "professional") return "/pro/dashboard";
        if (role === "admin") return "/admin";
        return "/login";
      },
      meta: { requiresAuth: true },
    },
    {
      path: "/portfolio",
      name: "portfolio",
      component: StudentPortfolioView,
      meta: { requiresAuth: true },
    },
    {
      path: "/lettres",
      name: "letters",
      component: LettersView,
      meta: { requiresAuth: true },
    },
    {
      path: "/projets",
      name: "projets",
      component: ProjectsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/stages",
      name: "stages",
      component: StagesView,
      meta: { requiresAuth: true },
    },
    {
      path: "/certifications",
      name: "certifications",
      component: CertificationsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/activites",
      name: "activites",
      component: ActivitesView,
      meta: { requiresAuth: true },
    },
    { path: "/github", component: Placeholder, meta: { requiresAuth: true } },
    { path: "/recos", component: Placeholder, meta: { requiresAuth: true } },
    {
      path: "/commentaires",
      component: Placeholder,
      meta: { requiresAuth: true },
    },
    { path: "/profile", name: "profile", component: StudentProfileView, meta: { requiresAuth: true } },
    { path: "/profile/edit", name: "profile-edit", component: ProfileEditView },
    { path: "/dashboard", name: "dashboard", component: DashboardProView },
    { path: "/portfolio", name: "portfolio", component: StudentPortfolioView },
    { path: "/lettres", name: "letters", component: LettersView },
    { path: "/projets", name: "projets", component: ProjectsView },
    { path: "/settings", name: "settings", component: SettingsView },
    { path: '/projets', name: 'projets', component: ProjectsView },
    { path: '/settings', name: 'settings', redirect: redirectSettingsByRole, meta: { requiresAuth: true } },
    { path: '/student/settings', name: 'student-settings', component: SettingsView, meta: { requiresAuth: true, requiresRole: 'student' } },
    { path: '/prof/settings', name: 'prof-settings', component: SettingsProfessorView, meta: { requiresAuth: true, requiresRole: 'teacher' } },
    { path: '/pro/settings', name: 'pro-settings', component: SettingsProfessionalView, meta: { requiresAuth: true, requiresRole: 'professional' } },
    { path: "/stages", name: "stages", component: StagesView },
    {
      path: "/certifications",
      name: "certifications",
      component: CertificationsView,
    },
    { path: "/activites", name: "activites", component: ActivitesView },
    { path: "/dashboard", redirect: "/pro/dashboard" },
    {
      path: "/pro/dashboard",
      name: "pro-dashboard",
      component: DashboardProView,
      meta: { requiresAuth: true, requiresRole: "professional" },
    },
    {
      path: "/student/dashboard",
      name: "student-dashboard",
      component: DashboardStudentView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    { path: "/feed", name: "feed", component: FeedView },
    {
      path: "/student/ai-recommendation",
      name: "student-ai-recommendation",
      component: StudentAIRecommendationView,
    },
    { path: "/feed", redirect: "/student/feed" },
    { path: "/student/feed", name: "student-feed", component: FeedView },
    { path: "/prof/feed", name: "prof-feed", component: FeedView },
    { path: "/pro/feed", name: "pro-feed", component: FeedView },
    {
      path: "/student/connexions",
      name: "student-connexions",
      component: ConnexionsProView,
    },
    {
      path: "/prof/connexions",
      name: "prof-connexions",
      component: ConnexionsProView,
    },
    {
      path: "/pro/connexions",
      name: "pro-connexions",
      component: ConnexionsProView,
    },
    {
      path: "/profile",
      name: "profile",
      component: StudentProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
      meta: { requiresAuth: true },

    },
    {
      path: "/pro/top-profiles",
      name: "pro-top-profiles",
      component: TopProfilesProView,
    },
    {
      path: "/top-profiles",
      name: "top-profiles",
      redirect: () => {
        const role = localStorage.getItem("role");
        if (role === "professional") return "/pro/top-profiles";
        return "/student/dashboard";
      },
    },
    {
      path: "/projects/:id",
      name: "feed-project-details",
      component: FeedProjectDetailsView,
    },
    {
      path: "/prof/dashboard",
      name: "prof-dashboard",
      component: DashboardProfView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },
    {
      path: "/prof/validations",
      name: "prof-validations",
      component: ValidationProfView,
    },
    {
      path: "/prof/recommandations",
      name: "prof-recommandations",
      component: RecommandationsProfView,
    },
    {
      path: "/prof/etudiants",
      name: "prof-etudiants",
      component: EtudiantsProfView,
    },
    {
      path: "/profile/student/:id",
      name: "prof-student-profile",
      component: StudentProfileView,
      props: true,
    },
    { path: "/validations", redirect: "/prof/validations" },
    {
      path: "/ai-analyzer",
      name: "ai-analyzer",
      component: AIPortfolioAnalyzerView,
    },
    {
      path: "/explore",
      name: "explore",
      redirect: redirectExploreByRole,
      meta: { requiresAuth: true },
    },
    {
      path: "/student/explore",
      name: "student-explore",
      component: ExploreView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/explore-prof",
      name: "explore-prof",
      component: ExploreProfView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },
    {
      path: "/explore-pro",
      name: "explore-pro",
      component: ExploreProView,
      meta: { requiresAuth: true, requiresRole: "professional" },
    },

    {
      path: "/dashboard",
      name: "dashboard",
      redirect: redirectByRole,
      meta: { requiresAuth: true },
    },

    {
      path: "/admin",
      component: AdminDashboardView,
      meta: { requiresAuth: true, requiresRole: "admin" },
    },
    {
      path: "/admin/profils",
      component: AdminProfilesView,
      meta: { requiresAuth: true, requiresRole: "admin" },
    },
    {
      path: "/admin/portfolios",
      component: AdminPortfoliosView,
      meta: { requiresAuth: true, requiresRole: "admin" },
    },
    {
      path: "/admin/activites",
      component: AdminActivitiesView,
      meta: { requiresAuth: true, requiresRole: "admin" },
    },
    {
      path: "/admin/projets",
      component: AdminProjetsView,
      meta: { requiresAuth: true, requiresRole: "admin" },
    },
    {
      path: "/admin/certifications",
      component: AdminCertificationsView,
      meta: { requiresAuth: true, requiresRole: "admin" },
    },
    {
      path: "/admin/parametres",
      component: Placeholder,
      meta: { requiresAuth: true, requiresRole: "admin" },
    },
    {
      path: "/profile",
      name: "profile",
      component: StudentProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
      meta: { requiresAuth: true },
    },
    { path: "/profile", name: "profile", component: StudentProfileView, meta: { requiresAuth: true } },
    { path: "/settings", redirect: redirectSettingsByRole, meta: { requiresAuth: true } },
    { path: "/portfolio", name: "portfolio", component: StudentPortfolioView },
    {
      path: "/portfolio/:id(\\d+)",
      name: "portfolio-by-id",
      component: StudentPortfolioView,
      props: true,
    },
    {
      path: "/lettres",
      name: "letters",
      component: LettersView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/projets",
      name: "projets",
      component: ProjectsView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/stages",
      name: "stages",
      component: StagesView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/certifications",
      name: "certifications",
      component: CertificationsView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/activites",
      name: "activites",
      component: ActivitesView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/recos",
      name: "student-recos",
      component: StudentRecommendationsView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/commentaires",
      name: "student-commentaires",
      component: StudentCommentsView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/github",
      name: "student-github",
      component: StudentGithubView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/ai-analyzer",
      name: "ai-analyzer",
      component: AIPortfolioAnalyzerView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },

    {
      path: "/student/dashboard",
      name: "student-dashboard",
      component: DashboardStudentView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/student/profile",
      name: "student-profile",
      component: StudentProfileView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/student/ai-recommendation",
      name: "student-ai-recommendation",
      component: StudentAIRecommendationView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/student/feed",
      name: "student-feed",
      component: FeedView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },
    {
      path: "/student/connexions",
      name: "student-connexions",
      component: ConnexionsProView,
      meta: { requiresAuth: true, requiresRole: "student" },
    },

    {
      path: "/prof/dashboard",
      name: "prof-dashboard",
      component: DashboardProfView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },
    {
      path: "/prof/feed",
      name: "prof-feed",
      component: FeedView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },
    {
      path: "/prof/connexions",
      name: "prof-connexions",
      component: ConnexionsProView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },
    {
      path: "/prof/validations",
      name: "prof-validations",
      component: ValidationProfView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },
    {
      path: "/prof/recommandations",
      name: "prof-recommandations",
      component: RecommandationsProfView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },
    {
      path: "/prof/etudiants",
      name: "prof-etudiants",
      component: EtudiantsProfView,
      meta: { requiresAuth: true, requiresRole: "teacher" },
    },

    {
      path: "/pro/dashboard",
      name: "pro-dashboard",
      component: DashboardProView,
    },
    { path: "/pro/feed", name: "pro-feed", component: FeedView },
    {
      path: "/pro/connexions",
      name: "pro-connexions",
      component: ConnexionsProView,
    },
    {
      path: "/pro/top-profiles",
      name: "pro-top-profiles",
      component: TopProfilesProView,
    },

    {
      path: "/feed",
      redirect: () => {
        const role = localStorage.getItem("role");
        if (role === "teacher") return "/prof/feed";
        if (role === "professional") return "/pro/feed";
        if (role === "student") return "/student/feed";
        return "/login";
      },
    },
    {
      path: "/top-profiles",
      redirect: () => {
        const role = localStorage.getItem("role");
        if (role === "professional") return "/pro/top-profiles";
        return "/student/dashboard";
      },
    },
    { path: "/validations", redirect: "/prof/validations" },
    {
      path: "/projects/:id",
      name: "feed-project-details",
      component: FeedProjectDetailsView,
    },
    {
      path: "/profile/user/:id(\\d+)",
      name: "user-profile-by-id",
      component: StudentProfileView,
      props: true,
    },
    {
      path: "/profile/student/:id(\\d+)",
      name: "student-profile-by-id",
      component: StudentProfileView,
      props: true,
    },
    {
      path: "/profile/student-:legacyId",
      redirect: (to) =>
        resolveLegacyProfileTarget(
          `student-${to.params.legacyId}`,
          to.query as Record<string, unknown>,
        ),
    },
    {
      path: "/profile/prof-:legacyId",
      redirect: (to) =>
        resolveLegacyProfileTarget(
          `prof-${to.params.legacyId}`,
          to.query as Record<string, unknown>,
        ),
    },
    {
      path: "/portfolio-creative/:id",
      component: PortfolioCreativeView,
    },
    {
      path: "/portfolio-professional/:id",
      component: PortfolioProfessionalView,
    },
    {
      path: "/profile/professional-:legacyId",
      redirect: (to) =>
        resolveLegacyProfileTarget(
          `professional-${to.params.legacyId}`,
          to.query as Record<string, unknown>,
        ),
    },
    {
      path: "/profile/student/:slug",
      redirect: (to) =>
        resolveLegacyProfileTarget(
          String(to.params.slug),
          to.query as Record<string, unknown>,
        ),
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth && !token) {
    return "/login";
  }

  if (token && to.meta.requiresRole && to.meta.requiresRole !== role) {
    return redirectByRole();
  }
});

export default router;
