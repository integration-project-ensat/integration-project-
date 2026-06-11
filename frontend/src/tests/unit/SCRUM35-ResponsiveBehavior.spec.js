/**
 * SCRUM-35 — Test Responsive Behavior (v2)
 *
 * But : vérifier que le composant StudentProfileHeader reste fonctionnel
 * et structurellement correct à différentes tailles d'écran.
 *
 * Note : jsdom n'applique pas les @media CSS — ces tests vérifient la
 * structure HTML et la logique Vue, pas le rendu CSS final.
 *
 * Breakpoints testés :
 *   Mobile  : 375px  (iPhone SE)
 *   Tablette: 768px  (iPad portrait)
 *   Desktop : 1280px (écran standard)
 *   Très petit : 320px (anciens Android)
 *
 * RESP-01 : Composant présent sur mobile (375px)
 * RESP-02 : Composant présent sur tablette (768px)
 * RESP-03 : Composant présent sur desktop (1280px)
 * RESP-04 : Éléments critiques visibles sur mobile
 * RESP-05 : Éléments critiques visibles sur tablette
 * RESP-06 : .cover-section contient .avatar-wrap (layout responsive)
 * RESP-07 : Onglets présents à toutes les tailles
 * RESP-08 : La section about toggle au clic sur l\'onglet À propos
 * RESP-09 : Le nom est dans un élément h1 (sémantique correcte)
 * RESP-10 : Pas d\'erreur au montage sur très petit écran (320px)
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, afterEach } from 'vitest'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return { ...actual, useRouter: vi.fn(() => ({ push: vi.fn() })) }
})

const MOCK_PROFILE = {
  name: 'Aimad Eddine Slimani',
  score: 500,
  title: 'Étudiant en Génie Informatique',
  school: 'ENSA Marrakech',
  location: 'Marrakech',
  recos: '12',
  bio: 'Bio de test.',
  email: 'aimad@test.com',
}

function setViewport(width) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  window.dispatchEvent(new Event('resize'))
}

function mountHeader(isOwner = false) {
  return mount(StudentProfileHeader, {
    props: { profile: MOCK_PROFILE, modelValue: '', isOwner },
  })
}

describe('SCRUM-35 — Test Responsive Behavior', () => {

  afterEach(() => {
    setViewport(1280)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-01
  // But : le composant doit se monter correctement sur mobile (375px).
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-01 : le composant se monte correctement sur mobile (375px)', () => {
    setViewport(375)
    const wrapper = mountHeader()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Aimad Eddine Slimani')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-02
  // But : le composant doit se monter correctement sur tablette (768px).
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-02 : le composant se monte correctement sur tablette (768px)', () => {
    setViewport(768)
    const wrapper = mountHeader()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
    expect(wrapper.find('.cover-img').exists()).toBe(true)
    expect(wrapper.find('.avatar-wrap').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-03
  // But : le composant doit se monter correctement sur desktop (1280px).
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-03 : le composant se monte correctement sur desktop (1280px)', () => {
    setViewport(1280)
    const wrapper = mountHeader()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('.tabs').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-04
  // But : les éléments critiques (nom, bannière, avatar, école) doivent rester
  // présents sur mobile — aucun ne doit être conditionnel à la taille.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-04 : éléments critiques présents sur mobile (375px)', () => {
    setViewport(375)
    const wrapper = mountHeader()
    expect(wrapper.find('.cover-img').exists()).toBe(true)
    expect(wrapper.find('.avatar-wrap').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('.school').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-05
  // But : sur tablette, les éléments critiques doivent aussi être tous présents.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-05 : éléments critiques présents sur tablette (768px)', () => {
    setViewport(768)
    const wrapper = mountHeader()
    expect(wrapper.find('.profile-info').exists()).toBe(true)
    expect(wrapper.find('.location').exists()).toBe(true)
    expect(wrapper.find('.recos-summary').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-06
  // But : .cover-section doit contenir .avatar-wrap — c'est la structure
  // qui permet le passage en colonne sur mobile via CSS @media.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-06 : .cover-section contient .avatar-wrap (layout responsive)', () => {
    const wrapper = mountHeader()
    const coverSection = wrapper.find('.cover-section')
    expect(coverSection.exists()).toBe(true)
    expect(coverSection.find('.avatar-wrap').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-07
  // But : la section onglets doit être présente à toutes les tailles d'écran.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-07 : les onglets sont présents à toutes les tailles', () => {
    for (const width of [320, 375, 768, 1280]) {
      setViewport(width)
      const wrapper = mountHeader()
      expect(wrapper.find('.tabs').exists()).toBe(true)
    }
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-08
  // But : la section À propos doit s'afficher/se masquer au clic sur l'onglet,
  // et ce comportement doit fonctionner quelle que soit la taille d'écran.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-08 : la section à propos toggle correctement au clic sur l\'onglet', async () => {
    setViewport(375)
    const wrapper = mountHeader(false) // non-owner voit l'onglet À propos
    expect(wrapper.find('.about-section').exists()).toBe(false)
    const aboutTab = wrapper.findAll('.tab').find(t => t.text() === 'À propos')
    await aboutTab.trigger('click')
    expect(wrapper.find('.about-section').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-09
  // But : le nom doit être dans un élément h1 — sémantique correcte
  // pour le référencement et l'accessibilité à toutes tailles.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-09 : le nom de l\'étudiant est dans un élément h1 (sémantique)', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Aimad Eddine Slimani')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // RESP-10
  // But : le composant doit se monter sans crash sur très petit écran (320px).
  // Aucune erreur Vue ne doit être lancée.
  // ─────────────────────────────────────────────────────────────────────────
  it('RESP-10 : aucune erreur au montage sur très petit écran (320px)', () => {
    setViewport(320)
    let error = null
    const wrapper = mount(StudentProfileHeader, {
      props: { profile: MOCK_PROFILE, modelValue: '' },
      global: {
        config: {
          errorHandler: (err) => { error = err },
        },
      },
    })
    expect(error).toBeNull()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
  })

})
