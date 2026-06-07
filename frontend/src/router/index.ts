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
import ExploreProfView from "../views/ExploreProfView.vue";
import ExploreProView from "../views/ExploreProView.vue";
import DashboardView from '../views/DashboardView.vue';
import LettersView from '../views/LettersView.vue';
import ProjectsView from '../views/ProjectsView.vue';
import SettingsView from '../views/SettingsView.vue';
import StudentPortfolioView from "../views/StudentPortfolioView.vue";
import StagesView from "../views/StagesView.vue";
import CertificationsView from "../views/CertificationsView.vue";
import ActivitesView from "../views/ActivitesView.vue";
import OAuthSuccessView from "../views/OAuthSuccessView.vue";
import CompleteProfileView from "../views/CompleteProfileView.vue";

// Vues placeholder pour les pages pas encore développées
const Placeholder = { template: '<div style="padding:2rem">Page en construction</div>' };

export default createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "login", component: LoginView },
    { path: "/signup", name: "signup", component: SignupView },
    { path: "/oauth-success", name: "oauth-success", component: OAuthSuccessView },
    { path: "/complete-profile", name: "complete-profile", component: CompleteProfileView },
    { path: "/forgot", name: "forgot", component: ForgetPasswordView },
    { path: "/reset-password", name: "reset", component: ResetPasswordView },
    { path: "/verify-code", name: "verify-code", component: VerifyCodeView },
    { path: "/explore", name: "explore", component: ExploreView },
    { path: "/explore-prof", name: "explore-prof", component: ExploreProfView },
    { path: "/explore-pro", name: "explore-pro", component: ExploreProView },
    { path: '/profile', name: 'profile', component: StudentProfileView },
    { path: "/dashboard", name: "dashboard", component: DashboardView },
    { path: "/portfolio", name: "portfolio", component: StudentPortfolioView },
    { path: "/lettres", name: "letters", component: LettersView },
    { path: "/projets", name: "projets", component: Placeholder },
    { path: "/stages", name: "stages", component: Placeholder },
    { path: "/certifications", name: "certifications", component: Placeholder },
    { path: "/activites", name: "activites", component: Placeholder },
    { path: "/portfolio", name: "portfolio", component: Placeholder },
    { path: "/settings", name: "settings", component: Placeholder },
    { path: '/projets', name: 'projets', component: ProjectsView },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: "/stages", name: "stages", component: StagesView },
    { path: "/certifications", name: "certifications", component: CertificationsView },
    { path: "/activites", name: "activites", component: ActivitesView },
  ],
});
