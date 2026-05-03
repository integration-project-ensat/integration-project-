// Définit toutes les routes de l'application et les guards de navigation. Si l'utilisateur n'est pas connecté ou n'a pas le bon rôle, il est redirigé.
// Contenu type
import { createRouter, createWebHistory } from 'vue-router'
import LoginView  from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import ForgetPasswordView from '@/views/ForgetPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'

export default createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/',        redirect: '/login' },
    { path: '/login',  name: 'login',  component: LoginView  },
    { path: '/signup', name: 'signup', component: SignupView },
    { path: '/forgot', name: 'forgot', component: ForgetPasswordView },
    { path: '/reset-password', name: 'reset', component: ResetPasswordView }
  ]
})