// Définit toutes les routes de l'application et les guards de navigation. Si l'utilisateur n'est pas connecté ou n'a pas le bon rôle, il est redirigé.
// Contenu type
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import ForgetPasswordView from "@/views/ForgetPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import VerifyCodeView from "../views/VerifyCodeView.vue";
import ExploreView from "../views/ExploreView.vue";
import ExploreProfView from "../views/ExploreProfView.vue";
import ExploreProView from "../views/ExploreProView.vue";
import DashboardProfView from "../views/DashboardProfView.vue";
import ProfStudentProfileView from "../views/ProfStudentProfileView.vue";
import RecommandationsProfView from "../views/RecommandationsProfView.vue";
import ValidationProfView from "../views/ValidationProfView.vue";

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
    { path: "/explore-prof", name: "explore-prof", component: ExploreProfView },
    { path: "/explore-pro", name: "explore-pro", component: ExploreProView },
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
      path: "/profile/student/:id",
      name: "prof-student-profile",
      component: ProfStudentProfileView,
    },
    { path: "/dashboard", redirect: "/prof/dashboard" },
    { path: "/validations", redirect: "/prof/validations" },
  ],
});
