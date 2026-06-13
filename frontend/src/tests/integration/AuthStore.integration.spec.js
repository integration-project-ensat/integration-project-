/**
 * TESTS D'INTÉGRATION — Store Pinia Auth ↔ Composants
 *
 * But : vérifier que le store d'authentification (Pinia) fonctionne
 * correctement comme module intégré, et que ses changements d'état
 * se répercutent sur les composants qui le consomment.
 *
 * Différence avec les tests unitaires :
 *   - Tests unitaires → store mocké, composant isolé
 *   - Tests d'intégration → vrai store Pinia instancié, vrai composant
 *     monté, flux de données réel entre store et UI.
 *
 * Ce qu'on teste ici :
 *   1. État initial du store (aucun utilisateur connecté)
 *   2. Action login → état mis à jour + localStorage
 *   3. Action logout → état réinitialisé + localStorage nettoyé
 *   4. Getter isAuthenticated reflète l'état réel
 *   5. Getter isAdmin / isStudent selon le rôle
 *   6. Restauration de session depuis localStorage
 *   7. Un composant Vue réagit aux changements du store
 */

import { mount }        from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/store/auth.js'

// Composant minimal qui lit le store pour tester l'intégration store → UI
const UserBanner = {
  template: `
    <div>
      <span v-if="auth.isAuthenticated" class="banner-connected">
        Connecté en tant que {{ auth.role }}
      </span>
      <span v-else class="banner-disconnected">Non connecté</span>
    </div>
  `,
  setup() {
    const auth = useAuthStore()
    return { auth }
  }
}

describe('Intégration : Store Auth (Pinia)', () => {

  let pinia

  beforeEach(() => {
    // Crée une nouvelle instance Pinia isolée pour chaque test
    pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-01
  // But : vérifier que le store démarre dans un état "déconnecté" propre.
  // C'est la base de tout le système d'auth — si l'état initial est mauvais,
  // tous les guards de navigation seront faux.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-01 : l\'état initial du store est null (aucun utilisateur connecté)', () => {
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(auth.role).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-02
  // But : vérifier que l'action login() met correctement à jour tous les
  // champs du store ET stocke le token/rôle dans le localStorage.
  // Le localStorage est essentiel pour la persistance entre rechargements.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-02 : login() met à jour le store et persiste dans localStorage', () => {
    const auth = useAuthStore()

    auth.login(
      { id: 1, email: 'etudiant@test.com', name: 'Aimad' },
      'jwt-token-abc123',
      'student'
    )

    expect(auth.user.email).toBe('etudiant@test.com')
    expect(auth.token).toBe('jwt-token-abc123')
    expect(auth.role).toBe('student')
    expect(auth.isAuthenticated).toBe(true)
    expect(localStorage.getItem('token')).toBe('jwt-token-abc123')
    expect(localStorage.getItem('role')).toBe('student')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-03
  // But : vérifier que logout() réinitialise entièrement le store ET supprime
  // les données du localStorage — un utilisateur déconnecté ne doit laisser
  // aucune trace de session.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-03 : logout() réinitialise le store et vide le localStorage', () => {
    const auth = useAuthStore()

    auth.login({ id: 1, email: 'x@x.com' }, 'token123', 'student')
    auth.logout()

    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(auth.role).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('role')).toBeNull()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-04
  // But : vérifier les getters de rôle — isAdmin, isTeacher, isStudent.
  // Ces getters sont utilisés dans la Navbar et les guards de route pour
  // afficher/cacher des éléments selon le rôle.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-04 : les getters de rôle retournent le bon booléen', () => {
    const auth = useAuthStore()

    auth.login({}, 'token', 'student')
    expect(auth.isStudent).toBe(true)
    expect(auth.isTeacher).toBe(false)
    expect(auth.isAdmin).toBe(false)

    auth.logout()
    auth.login({}, 'token', 'admin')
    expect(auth.isAdmin).toBe(true)
    expect(auth.isStudent).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-05
  // But : vérifier que restoreSession() relit le localStorage et restaure
  // le token et le rôle dans le store — essentiel pour que l'utilisateur
  // reste connecté après un rechargement de page.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-05 : restoreSession() restaure token et rôle depuis localStorage', () => {
    localStorage.setItem('token', 'persisted-token')
    localStorage.setItem('role',  'teacher')

    const auth = useAuthStore()
    auth.restoreSession()

    expect(auth.token).toBe('persisted-token')
    expect(auth.role).toBe('teacher')
    expect(auth.isAuthenticated).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-06
  // But : vérifier que restoreSession() ne fait rien si le localStorage est
  // vide — un store propre au démarrage, sans fausse session.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-06 : restoreSession() sans localStorage garde le store null', () => {
    const auth = useAuthStore()
    auth.restoreSession()

    expect(auth.token).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-07
  // But : test d'intégration store → composant Vue.
  // Un composant UserBanner qui lit le store doit afficher "Non connecté"
  // puis "Connecté en tant que student" après une action login().
  // Ce test vérifie la réactivité Pinia→Vue de bout en bout.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-07 : un composant Vue réagit aux changements du store auth', async () => {
    const wrapper = mount(UserBanner, {
      global: { plugins: [pinia] }
    })

    // Avant connexion
    expect(wrapper.find('.banner-disconnected').exists()).toBe(true)
    expect(wrapper.find('.banner-connected').exists()).toBe(false)

    // Connexion via le store
    const auth = useAuthStore()
    auth.login({ id: 1, email: 'test@test.com' }, 'token123', 'student')
    await wrapper.vm.$nextTick()

    // Après connexion
    expect(wrapper.find('.banner-connected').exists()).toBe(true)
    expect(wrapper.find('.banner-connected').text()).toContain('student')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-AUTH-08
  // But : vérifier que logout() depuis un composant monté met aussi à jour
  // le rendu — le composant repasse en "Non connecté".
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-AUTH-08 : logout() depuis le store met à jour le rendu du composant', async () => {
    const auth = useAuthStore()
    auth.login({ id: 1 }, 'tok', 'student')

    const wrapper = mount(UserBanner, {
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('.banner-connected').exists()).toBe(true)

    auth.logout()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.banner-disconnected').exists()).toBe(true)
    expect(wrapper.find('.banner-connected').exists()).toBe(false)
  })

})
