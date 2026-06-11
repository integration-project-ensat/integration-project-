/**
 * SCRUM-34 — Test Student Profile UI (v2)
 *
 * But : vérifier que tous les éléments visuels du profil étudiant
 * sont présents et correctement affichés dans le DOM.
 *
 * Le composant reçoit un objet `profile` en prop (pas de service interne).
 *
 * UI-01 : Section bannière (.cover-img) présente
 * UI-02 : Zone avatar (.avatar-wrap / .avatar) présente
 * UI-03 : Nom complet affiché dans le h1
 * UI-04 : Titre de filière affiché dans .title
 * UI-05 : École affichée dans .school
 * UI-06 : Localisation affichée dans .location
 * UI-07 : Bouton recos-summary présent avec compteur
 * UI-08 : Section onglets (.tabs) présente
 * UI-09 : Owner voit l'onglet "Modifier bio"
 * UI-10 : Section contact s'ouvre au clic sur "Contact info"
 * UI-11 : Email affiché dans la section contact
 * UI-12 : Banner-edit-overlay et avatar-edit-overlay visibles pour l'owner
 * UI-13 : LinkedIn absent de la section contact quand non fourni
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return { ...actual, useRouter: vi.fn(() => ({ push: vi.fn() })) }
})

const MOCK_PROFILE = {
  name: 'Aimad Eddine Slimani',
  score: 500,
  title: 'Étudiant en Génie Informatique — 3ème année',
  school: 'ENSA — École Nationale des Sciences Appliquées',
  location: 'Marrakech',
  recos: '8',
  bio: 'Étudiant passionné par le développement web et la qualité logicielle.',
  email: 'aimad.slimani@etud.ensa.ma',
  linkedin: null,
}

function mountUI(isOwner = false) {
  return mount(StudentProfileHeader, {
    props: { profile: MOCK_PROFILE, modelValue: '', isOwner },
  })
}

describe('SCRUM-34 — Test Student Profile UI', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // UI-01
  // But : la bannière colorée en haut du profil doit toujours être présente.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-01 : la section bannière (.cover-img) est présente dans le DOM', () => {
    const wrapper = mountUI()
    expect(wrapper.find('.cover-img').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-02
  // But : la zone avatar (wrap + cercle) doit être présente pour tout profil.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-02 : la zone avatar (.avatar-wrap / .avatar) est présente', () => {
    const wrapper = mountUI()
    expect(wrapper.find('.avatar-wrap').exists()).toBe(true)
    expect(wrapper.find('.avatar').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-03
  // But : le nom complet de l'étudiant doit être visible dans le h1.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-03 : le nom complet de l\'étudiant est affiché dans le h1', () => {
    const wrapper = mountUI()
    expect(wrapper.find('h1').text()).toBe('Aimad Eddine Slimani')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-04
  // But : le titre/filière doit être visible dans .title.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-04 : le titre de la filière est affiché dans .title', () => {
    const wrapper = mountUI()
    const title = wrapper.find('.title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toContain('Génie Informatique')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-05
  // But : l'école doit être affichée dans .school.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-05 : l\'école est affichée dans .school', () => {
    const wrapper = mountUI()
    const school = wrapper.find('.school')
    expect(school.exists()).toBe(true)
    expect(school.text()).toContain('ENSA')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-06
  // But : la localisation doit être visible dans .location.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-06 : la localisation est affichée dans .location', () => {
    const wrapper = mountUI()
    const location = wrapper.find('.location')
    expect(location.exists()).toBe(true)
    expect(location.text()).toContain('Marrakech')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-07
  // But : le bouton recos-summary avec le compteur de recommandations doit
  // être présent pour permettre l'accès aux recommandations détaillées.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-07 : le bouton recos-summary est présent avec le compteur', () => {
    const wrapper = mountUI()
    const recoBtn = wrapper.find('.recos-summary')
    expect(recoBtn.exists()).toBe(true)
    expect(recoBtn.find('.recos-count').text()).toContain('8')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-08
  // But : la section onglets (.tabs) doit toujours être présente.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-08 : la section onglets (.tabs) est présente', () => {
    const wrapper = mountUI()
    expect(wrapper.find('.tabs').exists()).toBe(true)
    expect(wrapper.findAll('.tab').length).toBeGreaterThan(0)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-09
  // But : l'owner voit l'onglet "Modifier bio" pour éditer son profil.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-09 : l\'owner voit l\'onglet "Modifier bio"', () => {
    const wrapper = mountUI(true)
    const tabTexts = wrapper.findAll('.tab').map(t => t.text())
    expect(tabTexts).toContain('Modifier bio')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-10
  // But : un clic sur "Contact info" dans la localisation doit ouvrir
  // la section de contact avec les informations détaillées.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-10 : la section contact s\'ouvre au clic sur "Contact info"', async () => {
    const wrapper = mountUI()
    expect(wrapper.find('.contact-section').exists()).toBe(false)
    await wrapper.find('.contact').trigger('click')
    expect(wrapper.find('.contact-section').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-11
  // But : l'email doit apparaître dans la section contact quand elle est ouverte.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-11 : l\'email est affiché dans la section contact', async () => {
    const wrapper = mountUI()
    await wrapper.find('.contact').trigger('click')
    const contactSection = wrapper.find('.contact-section')
    expect(contactSection.text()).toContain('aimad.slimani@etud.ensa.ma')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-12
  // But : l'owner voit les overlays de modification de bannière et d'avatar.
  // Ces overlays permettent le changement d'image via un clic.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-12 : l\'owner voit les overlays de modification (bannière et avatar)', () => {
    const wrapper = mountUI(true)
    expect(wrapper.find('.banner-edit-overlay').exists()).toBe(true)
    expect(wrapper.find('.avatar-edit-overlay').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-13
  // But : si le profil n'a pas de LinkedIn, la section contact ne doit pas
  // afficher de lien LinkedIn.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-13 : LinkedIn absent de la section contact quand linkedin = null', async () => {
    const wrapper = mountUI()
    await wrapper.find('.contact').trigger('click')
    const contactSection = wrapper.find('.contact-section')
    expect(contactSection.text()).not.toContain('LinkedIn')
  })

})
