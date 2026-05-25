// Définit toutes les routes de l'application et les guards de navigation. Si l'utilisateur n'est pas connecté ou n'a pas le bon rôle, il est redirigé.
// Contenu type
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import ForgetPasswordView from "@/views/ForgetPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import VerifyCodeView from "../views/VerifyCodeView.vue";
import ExploreView from "../views/ExploreView.vue";
import AdminDashboardView from "../views/AdminDashboardView.vue";
import AdminProfilesView from "../views/AdminProfilesView.vue";
import AdminPortfoliosView from "../views/AdminPortfoliosView.vue";
import AdminActivitiesView from "../views/AdminActivitiesView.vue";
import AdminProjetsView from "../views/AdminProjetsView.vue";
import AdminCertificationsView from '../views/AdminCertificationsView.vue';
import OAuthSuccessView from "../views/OAuthSuccessView.vue";
import CompleteProfileView from "../views/CompleteProfileView.vue";

export default createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "login", component: LoginView },
    { path: "/signup", name: "signup", component: SignupView },
    { path: "/forgot", name: "forgot", component: ForgetPasswordView },
    { path: "/reset-password", name: "reset", component: ResetPasswordView },
    { path: "/verify-code", name: "verify-code", component: VerifyCodeView },
    { path: "/explore", name: "explore", component: ExploreView },
    { path: '/admin',component: AdminDashboardView },
    { path: '/admin/profils', component : AdminProfilesView },
    { path: '/admin/portfolios', component: AdminPortfoliosView },
    { path:  '/admin/activites', component: AdminActivitiesView },
    { path: "/admin/projets" , component:AdminProjetsView },
    { path: '/admin/certifications', component: AdminCertificationsView },
    { path: "/oauth-success", name: "oauth-success", component: OAuthSuccessView },
    { path: "/complete-profile", name: "complete-profile", component: CompleteProfileView }
  ],
});
