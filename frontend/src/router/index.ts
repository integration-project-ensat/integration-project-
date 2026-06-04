// Définit toutes les routes de l'application et les guards de navigation. Si l'utilisateur n'est pas connecté ou n'a pas le bon rôle, il est redirigé.
// Contenu type
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import ForgetPasswordView from "@/views/ForgetPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import VerifyCodeView from "../views/VerifyCodeView.vue";
import StudentProfileView from '../views/StudentProfileView.vue';
import ExploreView from "../views/ExploreView.vue";
import AdminDashboardView from "../views/AdminDashboardView.vue";
import AdminProfilesView from "../views/AdminProfilesView.vue";
import AdminPortfoliosView from "../views/AdminPortfoliosView.vue";
import AdminActivitiesView from "../views/AdminActivitiesView.vue";
import AdminProjetsView from "../views/AdminProjetsView.vue";
import AdminCertificationsView from '../views/AdminCertificationsView.vue';
import OAuthSuccessView from "../views/OAuthSuccessView.vue";
import CompleteProfileView from "../views/CompleteProfileView.vue";
import ExploreProfView from "../views/ExploreProfView.vue";
import ExploreProView from "../views/ExploreProView.vue";
import DashboardProfView from "../views/DashboardProfView.vue";
import DashboardProView from "../views/DashboardProView.vue";
import DashboardStudentView from "../views/DashboardStudentView.vue";
import ConnexionsProView from "../views/ConnexionsProView.vue";
import FeedProjectDetailsView from "../views/FeedProjectDetailsView.vue";
import FeedView from "../views/FeedView.vue";
import EtudiantsProfView from "../views/EtudiantsProfView.vue";
import ProfStudentProfileView from "../views/ProfStudentProfileView.vue";
import RecommandationsProfView from "../views/RecommandationsProfView.vue";
import TopProfilesProView from "../views/TopProfilesProView.vue";
import ValidationProfView from "../views/ValidationProfView.vue";
import StagesView from "../views/StagesView.vue";
import CertificationsView from "../views/CertificationsView.vue";
import ActivitesView from "../views/ActivitesView.vue";

// Vues placeholder pour les pages pas encore développées
const Placeholder = { template: '<div style="padding:2rem">Page en construction</div>' };

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "login", component: LoginView },
    { path: "/signup", name: "signup", component: SignupView },
    { path: "/forgot", name: "forgot", component: ForgetPasswordView },
    { path: "/reset-password", name: "reset", component: ResetPasswordView },
    { path: "/verify-code", name: "verify-code", component: VerifyCodeView },
    { path: "/explore", name: "explore", component: ExploreView },
    { path: '/admin', component: AdminDashboardView, meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: '/admin/profils', component: AdminProfilesView, meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: '/admin/portfolios', component: AdminPortfoliosView, meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: '/admin/activites', component: AdminActivitiesView, meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: '/admin/projets', component: AdminProjetsView, meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: '/admin/certifications', component: AdminCertificationsView, meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: '/admin/parametres', component: Placeholder, meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: "/oauth-success", name: "oauth-success", component: OAuthSuccessView },
    { path: "/complete-profile", name: "complete-profile", component: CompleteProfileView },
    { path: "/explore-prof", name: "explore-prof", component: ExploreProfView },
    { path: "/explore-pro", name: "explore-pro", component: ExploreProView },
    {
      path: "/dashboard",
      name: "dashboard",
      redirect: () => {
        const role = localStorage.getItem('role')
        if (role === 'student') return '/student/dashboard'
        if (role === 'teacher') return '/prof/dashboard'
        if (role === 'professional') return '/pro/dashboard'
        if (role === 'admin') return '/admin'
        return '/login'
      },
      meta: { requiresAuth: true }
    },
    {
      path: "/pro/dashboard",
      name: "pro-dashboard",
      component: DashboardProView,
    },
    {
      path: "/student/dashboard",
      name: "student-dashboard",
      component: DashboardStudentView,
    },
    { path: "/feed", name: "feed", component: FeedView },
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
      path: "/pro/top-profiles",
      name: "pro-top-profiles",
      component: TopProfilesProView,
    },
    {
      path: "/top-profiles",
      name: "top-profiles",
      redirect: () => {
        const role = localStorage.getItem('role')
        if (role === 'professional') return '/pro/top-profiles'
        return '/student/dashboard'
      }
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
    },
    { path: "/validations", redirect: "/prof/validations" },
    { path: "/stages", name: "stages", component: StagesView },
    { path: "/certifications", name: "certifications", component: CertificationsView },
    { path: "/activites", name: "activites", component: ActivitesView },

  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // Redirection vers login si pas authentifié
  if (to.meta.requiresAuth && !token) {
    return '/login'
  }

  // Redirection si rôle insuffisant
  if (to.meta.requiresRole && to.meta.requiresRole !== role) {
    if (role === 'student') return '/student/dashboard'
    if (role === 'teacher') return '/prof/dashboard'
    if (role === 'professional') return '/pro/dashboard'
    if (role === 'admin') return '/admin'
    return '/login'
  }

  // Redirections intelligentes pour les routes génériques vers rôle spécifique
  if (to.path === '/feed') {
    if (role === 'teacher') return '/prof/feed'
    if (role === 'professional') return '/pro/feed'
    if (role === 'student') return '/student/feed'
    return '/login'
  }

  if (to.path === '/top-profiles') {
    if (role === 'professional') return '/pro/top-profiles'
    return '/student/dashboard'
  }

  if (to.path === '/validations') {
    if (role === 'teacher') return '/prof/validations'
    return '/student/dashboard'
  }
})

export default router
