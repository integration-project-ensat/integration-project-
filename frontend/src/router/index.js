// Définit toutes les routes de l'application et les guards de navigation. Si l'utilisateur n'est pas connecté ou n'a pas le bon rôle, il est redirigé.
// Contenu type
// routes: [
//   { path: '/',              component: HomeView },
//   { path: '/dashboard',     component: DashboardView,
//     meta: { requiresAuth: true } },
//   { path: '/admin',         component: AdminView,
//     meta: { requiresRole: 'admin' } },
//   { path: '/portfolio/:id', component: PortfolioView }
// ]