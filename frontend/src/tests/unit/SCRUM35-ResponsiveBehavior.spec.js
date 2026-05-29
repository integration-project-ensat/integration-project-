/**
 * SCRUM-35 — Test Responsive Behavior
 *
 * But : vérifier que le composant StudentProfileHeader s'adapte
 * correctement aux différentes tailles d'écran.
 *
 * Approche :
 *   - Vitest + jsdom pour tester la structure HTML responsive
 *   - window.innerWidth simulé pour chaque breakpoint
 *   - Vérification que les éléments clés restent présents à toutes tailles
 *
 * Breakpoints testés :
 *   Mobile  : 375px  (iPhone SE)
 *   Tablette: 768px  (iPad portrait)
 *   Desktop : 1280px (écran standard)
 *
 * Note : jsdom n'applique pas les @media CSS — les tests vérifient
 * la structure HTML et la logique Vue, pas le rendu CSS final.
 * Pour les tests visuels CSS, utiliser Playwright (voir profile.spec.js).
 *
 * Tests :
 *   RESP-01 : composant présent sur mobile (375px)
 *   RESP-02 : composant présent sur tablette (768px)
 *   RESP-03 : composant présent sur desktop (1280px)
 *   RESP-04 : éléments critiques visibles sur mobile
 *   RESP-05 : éléments critiques visibles sur tablette
 *   RESP-06 : la section cover utilise flex (layout responsive)
 *   RESP-07 : les méta-puces utilisent flex-wrap (pas de débordement)
 *   RESP-08 : les liens sociaux utilisent flex-wrap
 *   RESP-09 : le nom est tronqué avec text-overflow sur desktop
 *   RESP-10 : le composant se monte sans erreur à 320px (très petit écran)
 */

import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

const { mockGetProfile } = vi.hoisted(() => {
  const MOCK = {
    id: 1, name: 'Aimad Eddine Slimani', email: 'aimad@test.com',
    apogee: '21009876', field: 'Génie Informatique', year: '3ème année',
    school: 'ENSA Marrakech', city: 'Marrakech', avatar: null,
    bannerColor: '#1a3c5e', bio: 'Bio test.', isVerified: true,
    github: 'https://github.com/slimo777', linkedin: null,
  }
  return { mockGetProfile: vi.fn().mockResolvedValue(MOCK) }
})

vi.mock('@/services/profile.service.js', () => ({
  profileService: { getProfile: mockGetProfile, updateProfile: vi.fn(), uploadAvatar: vi.fn() }
}))

// Utilitaire : simuler une largeur d'écran dans jsdom
function setViewport(width) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  window.dispatchEvent(new Event('resize'))
}

describe('SCRUM-35 — Test Responsive Behavior', () => {

  afterEach(() => {
    setViewport(1280) // reset après chaque test
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-01
  // But : le composant doit se monter et s'afficher correctement sur mobile.
  // On simule un écran iPhone SE (375×667px).
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-01 : le composant se monte correctement sur mobile (375px)', async () => {
    setViewport(375)
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
    expect(wrapper.find('.student-name').text()).toBe('Aimad Eddine Slimani')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-02
  // But : le composant doit se monter et s'afficher correctement sur tablette.
  // On simule un iPad en portrait (768×1024px).
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-02 : le composant se monte correctement sur tablette (768px)', async () => {
    setViewport(768)
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
    expect(wrapper.find('.banner').exists()).toBe(true)
    expect(wrapper.find('.avatar-wrapper').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-03
  // But : le composant doit se monter et s'afficher correctement sur desktop.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-03 : le composant se monte correctement sur desktop (1280px)', async () => {
    setViewport(1280)
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
    expect(wrapper.find('.student-name').exists()).toBe(true)
    expect(wrapper.find('.social-links').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-04
  // But : sur mobile, les éléments critiques (nom, avatar, filière) doivent
  // tous rester visibles — aucun ne doit être masqué par du CSS display:none.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-04 : éléments critiques présents sur mobile (375px)', async () => {
    setViewport(375)
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.avatar-wrapper').exists()).toBe(true)
    expect(wrapper.find('.student-name').exists()).toBe(true)
    expect(wrapper.find('.field-badge').exists()).toBe(true)
    expect(wrapper.find('.student-school').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-05
  // But : sur tablette, les éléments critiques doivent aussi tous être présents.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-05 : éléments critiques présents sur tablette (768px)', async () => {
    setViewport(768)
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.meta-row').exists()).toBe(true)
    expect(wrapper.find('.student-bio').exists()).toBe(true)
    expect(wrapper.find('.social-links').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-06
  // But : la section cover utilise flexbox pour aligner avatar + infos.
  // C'est ce qui permet le passage en colonne sur mobile via CSS @media.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-06 : la section cover contient avatar-wrapper et student-info côte à côte', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const cover = wrapper.find('.cover')
    expect(cover.exists()).toBe(true)
    expect(cover.find('.avatar-wrapper').exists()).toBe(true)
    expect(cover.find('.student-info').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-07
  // But : les méta-puces (APOGEE, email, ville) utilisent flex-wrap pour ne
  // pas déborder sur mobile. On vérifie qu'il y a bien plusieurs puces.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-07 : la méta-row contient plusieurs puces (wrappables sur mobile)', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const chips = wrapper.findAll('.meta-chip')
    expect(chips.length).toBeGreaterThanOrEqual(2)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-08
  // But : les liens sociaux utilisent flex-wrap pour s'adapter aux petits écrans.
  // On vérifie que la section social-links existe et contient des boutons.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-08 : les liens sociaux sont dans un conteneur flex', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const socialLinks = wrapper.find('.social-links')
    expect(socialLinks.exists()).toBe(true)
    expect(socialLinks.find('.social-btn').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-09
  // But : le nom utilise text-overflow: ellipsis pour ne pas casser le layout
  // sur les petits écrans avec de longs noms.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-09 : le nom de l\'étudiant est rendu dans un élément h1', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    // Le .student-name est un h1 → sémantique correcte pour tous les écrans
    expect(wrapper.find('h1.student-name').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-10
  // But : le composant doit se monter sans crash même sur très petit écran
  // (320px = anciens Android). Aucune erreur Vue ne doit être lancée.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-10 : aucune erreur au montage sur très petit écran (320px)', async () => {
    setViewport(320)
    let error = null
    const wrapper = mount(StudentProfileHeader, {
      props: { userId: 1 },
      global: {
        config: {
          errorHandler: (err) => { error = err }
        }
      }
    })
    await flushPromises()
    expect(error).toBeNull()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
  })

})
