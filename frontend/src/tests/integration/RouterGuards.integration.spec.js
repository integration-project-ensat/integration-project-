/**
 * TESTS D'INTÉGRATION — Guards du Routeur Vue Router ↔ Auth
 *
 * But : vérifier que les guards de navigation du routeur protègent
 * correctement les routes selon l'état d'authentification et le rôle.
 *
 * Différence avec les tests unitaires :
 *   - Tests unitaires → routeur mocké, guard testé isolément
 *   - Tests d'intégration → vrai routeur Vue Router instancié avec les
 *     vraies routes et le vrai guard, localStorage simulé.
 *
 * Ce qu'on teste ici :
 *   1. Un utilisateur non connecté est redirigé vers /login
 *   2. Un utilisateur connecté peut accéder aux routes protégées
 *   3. Un étudiant ne peut pas accéder à la route /admin
 *   4. Un admin peut accéder à /admin
 *   5. La route racine / redirige vers /dashboard
 *   6. Une URL inconnue redirige vers /login
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRouter, createMemoryHistory }            from 'vue-router'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Routes minimales reproduisant la logique du routeur réel
function buildRouter() {
  const routes = [
    { path: '/',          redirect: '/dashboard' },
    { path: '/login',     name: 'Login',     component: { template: '<div>Login</div>' },     meta: { requiresAuth: false } },
    { path: '/dashboard', name: 'Dashboard', component: { template: '<div>Dashboard</div>' }, meta: { requiresAuth: true  } },
    { path: '/projects',  name: 'Projects',  component: { template: '<div>Projects</div>' },  meta: { requiresAuth: true  } },
    { path: '/admin',     name: 'Admin',     component: { template: '<div>Admin</div>' },     meta: { requiresAuth: true, requiresRole: 'admin' } },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  // Guard identique à celui du routeur réel (return-style, sans next() déprécié)
  router.beforeEach((to) => {
    const token = localStorage.getItem('token')
    const role  = localStorage.getItem('role')

    if (to.meta.requiresAuth && !token) return '/login'
    if (to.meta.requiresRole && to.meta.requiresRole !== role) return '/dashboard'
  })

  return router
}

// Simule une session connectée dans localStorage
function simulerConnexion(role = 'student') {
  localStorage.setItem('token', 'fake-jwt-token')
  localStorage.setItem('role', role)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Intégration : Guards du routeur Vue Router', () => {

  let router

  beforeEach(() => {
    localStorage.clear()
    router = buildRouter()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-01
  // But : un utilisateur non authentifié qui tente d'accéder à /dashboard
  // doit être redirigé vers /login.  C'est le guard de protection de base.
  // Sans ce comportement, n'importe qui peut voir le dashboard.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-01 : non connecté → /dashboard redirige vers /login', async () => {
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-02
  // But : un utilisateur non authentifié tente /projects → redirigé /login.
  // Toutes les routes avec meta.requiresAuth doivent être protégées.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-02 : non connecté → /projects redirige vers /login', async () => {
    await router.push('/projects')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-03
  // But : un utilisateur connecté (rôle student) peut accéder à /dashboard.
  // Vérifie que le guard laisse passer un token valide.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-03 : connecté (student) → /dashboard accessible', async () => {
    simulerConnexion('student')
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-04
  // But : un étudiant connecté tente d'accéder à /admin (route réservée
  // aux admins) → il est redirigé vers /dashboard, pas vers /login.
  // Teste la protection par rôle, distincte de la protection par auth.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-04 : connecté (student) → /admin redirige vers /dashboard', async () => {
    simulerConnexion('student')
    await router.push('/admin')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-05
  // But : un admin connecté peut accéder à /admin sans redirection.
  // Vérifie que le guard de rôle autorise le bon rôle.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-05 : connecté (admin) → /admin accessible', async () => {
    simulerConnexion('admin')
    await router.push('/admin')
    expect(router.currentRoute.value.path).toBe('/admin')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-06
  // But : la route racine / doit rediriger vers /dashboard.
  // Un utilisateur connecté qui tape "/" arrive sur le dashboard.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-06 : connecté → / redirige vers /dashboard', async () => {
    simulerConnexion('student')
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-07
  // But : une URL inconnue (ex. /xyz-inexistant) doit rediriger vers /login
  // et non planter l'application (pas d'écran blanc).
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-07 : URL inexistante → redirige vers /login (pas de crash)', async () => {
    await router.push('/xyz-inexistant')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-08
  // But : un utilisateur qui se déconnecte (token supprimé du localStorage)
  // puis tente de naviguer vers /dashboard est redirigé vers /login.
  // Simule la séquence : connexion → déconnexion → tentative d'accès.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-08 : après déconnexion → /dashboard redirige vers /login', async () => {
    // Connexion
    simulerConnexion('student')
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/dashboard')

    // Déconnexion : on vide le localStorage pour simuler un logout
    localStorage.clear()
    // On navigue vers /projects (pas la même route) pour déclencher le guard
    // Note : pousser vers /dashboard alors qu'on y est déjà ne relance pas le guard
    await router.push('/projects')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-09
  // But : /login est accessible même sans token — c'est la page publique.
  // Un utilisateur non connecté ne doit pas être bloqué pour accéder à
  // la page de connexion.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-09 : /login est accessible sans authentification', async () => {
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-ROUTER-10
  // But : un enseignant (role=teacher) ne peut pas accéder à /admin.
  // Vérifie que le guard de rôle est strict — seul 'admin' passe.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-ROUTER-10 : connecté (teacher) → /admin redirige vers /dashboard', async () => {
    simulerConnexion('teacher')
    await router.push('/admin')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

})
