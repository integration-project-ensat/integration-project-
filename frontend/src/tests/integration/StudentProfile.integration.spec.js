/**
 * TESTS D'INTÉGRATION — ProfileView ↔ StudentProfileHeader ↔ profileService
 *
 * But : tester que les 3 fichiers du profil fonctionnent correctement ENSEMBLE.
 *
 * Différence avec les tests unitaires :
 *   - Tests unitaires    → StudentProfileHeader seul, service mocké
 *   - Tests d'intégration → ProfileView + StudentProfileHeader + store auth
 *     montés ensemble avec des flux de données réels entre eux.
 *
 * Ce qu'on teste ici :
 *   INT-SP-01 : ProfileView rend bien StudentProfileHeader
 *   INT-SP-02 : userId du store auth est transmis en prop
 *   INT-SP-03 : userId = null quand aucun utilisateur connecté
 *   INT-SP-04 : après API, le nom est visible dans la page complète
 *   INT-SP-05 : skeleton visible avant la résolution API
 *   INT-SP-06 : badge vérifié visible dans ProfileView après chargement
 *   INT-SP-07 : lien GitHub accessible depuis ProfileView
 *   INT-SP-08 : changement d'utilisateur dans le store met à jour userId
 */

import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ProfileView          from '@/views/ProfileView.vue'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'
import { useAuthStore }     from '@/store/auth.js'

// ── Profil simulé ───────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  id:          1,
  name:        'Aimad Eddine Slimani',
  email:       'aimad@test.com',
  apogee:      '21009876',
  field:       'Génie Informatique',
  year:        '3ème année',
  school:      'ENSA Marrakech',
  city:        'Marrakech',
  avatar:      null,
  bannerColor: '#1a3c5e',
  bio:         'Étudiant passionné par le développement web.',
  isVerified:  true,
  github:      'https://github.com/slimo777',
  linkedin:    null,
}

// ── Mock du service ─────────────────────────────────────────────────────────
vi.mock('@/services/profile.service.js', () => ({
  profileService: {
    getProfile:    vi.fn().mockResolvedValue(MOCK_PROFILE),
    updateProfile: vi.fn(),
    uploadAvatar:  vi.fn(),
  }
}))

describe('Intégration : ProfileView ↔ StudentProfileHeader ↔ profileService', () => {

  // Chaque test repart avec un store Pinia vide (isolation)
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-01
  // But : vérifier que ProfileView inclut bien StudentProfileHeader dans
  // son arbre DOM. Si ce test échoue, le composant n'est pas importé/utilisé.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-01 : ProfileView rend le composant StudentProfileHeader', () => {
    const pinia   = createPinia()
    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    expect(wrapper.findComponent(StudentProfileHeader).exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-02
  // But : vérifier le flux store → ProfileView → StudentProfileHeader.
  // Quand l'utilisateur est connecté (id: 42), cette valeur doit arriver
  // en prop dans StudentProfileHeader. C'est toute la chaîne de données.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-02 : userId du store auth est transmis en prop à StudentProfileHeader', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.login({ id: 42 }, 'mock-token', 'student')

    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    const header  = wrapper.findComponent(StudentProfileHeader)
    expect(header.props('userId')).toBe(42)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-03
  // But : quand aucun utilisateur n'est connecté (auth.user = null),
  // la prop userId transmise doit être null et non undefined.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-03 : userId = null quand aucun utilisateur n\'est connecté', () => {
    const pinia   = createPinia()
    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    const header  = wrapper.findComponent(StudentProfileHeader)
    expect(header.props('userId')).toBeNull()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-04
  // But : end-to-end du flux complet — depuis le store jusqu'au DOM.
  // Après que l'API répond, le nom du profil doit être visible dans la page.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-04 : le nom du profil est visible dans ProfileView après chargement', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.login({ id: 1 }, 'mock-token', 'student')

    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(wrapper.text()).toContain('Aimad Eddine Slimani')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-05
  // But : avant que l'API réponde, le skeleton doit être visible — même
  // depuis ProfileView. Vérifie que l'état loading se propage jusqu'au DOM.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-05 : le skeleton est visible dans ProfileView avant la résolution API', () => {
    const pinia   = createPinia()
    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    // Avant flushPromises → loading = true → skeleton présent
    expect(wrapper.find('.skeleton-name').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-06
  // But : vérifier que le badge "vérifié" remonte jusqu'au DOM de ProfileView.
  // Ce test couvre la chaîne : API → StudentProfileHeader → DOM → ProfileView.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-06 : le badge vérifié est visible dans ProfileView après chargement', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.login({ id: 1 }, 'mock-token', 'student')

    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(wrapper.find('.verified-badge').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-07
  // But : le lien GitHub doit être accessible et cliquable depuis ProfileView.
  // Vérifie que les liens sociaux remontent correctement depuis le composant.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-07 : le lien GitHub est accessible depuis ProfileView', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.login({ id: 1 }, 'mock-token', 'student')

    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    await flushPromises()

    const githubBtn = wrapper.find('.social-btn.github')
    expect(githubBtn.exists()).toBe(true)
    expect(githubBtn.attributes('href')).toBe('https://github.com/slimo777')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-08
  // But : vérifier la réactivité du store → prop.
  // Quand on change d'utilisateur dans le store, la prop userId dans
  // StudentProfileHeader doit se mettre à jour automatiquement.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-08 : changer d\'utilisateur dans le store met à jour la prop userId', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.login({ id: 10 }, 'token-a', 'student')

    const wrapper = mount(ProfileView, { global: { plugins: [pinia] } })
    expect(wrapper.findComponent(StudentProfileHeader).props('userId')).toBe(10)

    // Connexion d'un autre utilisateur
    auth.login({ id: 99 }, 'token-b', 'Prof')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(StudentProfileHeader).props('userId')).toBe(99)
  })

})
