/**
 * SCRUM-36 — Validate Frontend/Backend Integration (v2)
 *
 * But : valider que le composant StudentProfileHeader affiche correctement
 * les données de la forme retournée par le backend, et que les interactions
 * utilisateur déclenchent les bons événements vers le parent.
 *
 * Le composant reçoit un objet `profile` en prop (fourni par StudentProfileView
 * qui appelle l'API). Ces tests vérifient l'intégration données → affichage.
 *
 * BE-01 : Toutes les données du profil sont affichées (nom, titre, école)
 * BE-02 : La localisation est affichée
 * BE-03 : La bio apparaît dans la section À propos
 * BE-04 : L'email est affiché dans la section contact
 * BE-05 : Le LinkedIn est affiché dans la section contact quand fourni
 * BE-06 : LinkedIn absent quand le backend ne fournit pas de lien
 * BE-07 : Le composant gère un profil sans champs optionnels (robustesse)
 * BE-08 : update:modelValue émis correctement en réponse aux onglets
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return { ...actual, useRouter: vi.fn(() => ({ push: vi.fn() })) }
})

// Profil tel que retourné par le backend, mappé à la forme du composant
const BACKEND_PROFILE = {
  name: 'Karim Benali',
  score: 320,
  title: 'Étudiant en Génie Civil — 2ème année',
  school: 'ENSA Marrakech',
  location: 'Casablanca',
  recos: '5',
  bio: 'Passionné par la construction durable.',
  email: 'karim.benali@etud.ensa.ma',
  linkedin: 'https://linkedin.com/in/karimbenali',
}

function mountWithProfile(profile, extraProps = {}) {
  return mount(StudentProfileHeader, {
    props: { profile, modelValue: '', ...extraProps },
  })
}

describe('SCRUM-36 — Validate Frontend/Backend Integration', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // BE-01
  // But : quand le backend fournit un profil complet, le nom, le titre et
  // l'école doivent tous s'afficher dans le DOM.
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-01 : le nom, le titre et l\'école du backend sont affichés', () => {
    const wrapper = mountWithProfile(BACKEND_PROFILE)
    expect(wrapper.find('h1').text()).toBe('Karim Benali')
    expect(wrapper.find('.title').text()).toContain('Génie Civil')
    expect(wrapper.find('.school').text()).toContain('ENSA')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // BE-02
  // But : la localisation fournie par le backend doit être visible.
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-02 : la localisation du backend est affichée dans .location', () => {
    const wrapper = mountWithProfile(BACKEND_PROFILE)
    expect(wrapper.find('.location').text()).toContain('Casablanca')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // BE-03
  // But : la bio fournie par le backend doit apparaître dans la section
  // À propos quand l'onglet est activé. C'est le flux backend → section bio.
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-03 : la bio du backend apparaît dans la section À propos', async () => {
    const wrapper = mountWithProfile(BACKEND_PROFILE, { isOwner: false })
    const aboutTab = wrapper.findAll('.tab').find(t => t.text() === 'À propos')
    await aboutTab.trigger('click')
    const aboutSection = wrapper.find('.about-section')
    expect(aboutSection.exists()).toBe(true)
    expect(aboutSection.text()).toContain('construction durable')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // BE-04
  // But : l'email fourni par le backend doit être visible dans la section
  // contact quand l'utilisateur clique sur "Contact info".
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-04 : l\'email du backend est affiché dans la section contact', async () => {
    const wrapper = mountWithProfile(BACKEND_PROFILE)
    await wrapper.find('.contact').trigger('click')
    expect(wrapper.find('.contact-section').text()).toContain('karim.benali@etud.ensa.ma')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // BE-05
  // But : quand le backend fournit un profil LinkedIn, le lien doit apparaître
  // dans la section contact. C'est le flux : backend → prop → affichage.
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-05 : le LinkedIn du backend est affiché dans la section contact', async () => {
    const wrapper = mountWithProfile(BACKEND_PROFILE)
    await wrapper.find('.contact').trigger('click')
    const contactSection = wrapper.find('.contact-section')
    expect(contactSection.text()).toContain('LinkedIn')
    const linkedinLink = contactSection.find('a[href*="linkedin"]')
    expect(linkedinLink.exists()).toBe(true)
    expect(linkedinLink.attributes('href')).toBe('https://linkedin.com/in/karimbenali')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // BE-06
  // But : quand le backend ne fournit pas de LinkedIn (null/undefined),
  // aucun lien LinkedIn ne doit apparaître dans la section contact.
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-06 : LinkedIn absent de la section contact quand backend retourne null', async () => {
    const profileSansLinkedin = { ...BACKEND_PROFILE, linkedin: null }
    const wrapper = mountWithProfile(profileSansLinkedin)
    await wrapper.find('.contact').trigger('click')
    expect(wrapper.find('.contact-section').text()).not.toContain('LinkedIn')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // BE-07
  // But : le composant doit rester robuste si le backend ne fournit pas les
  // champs optionnels (bio, email, linkedin, website). Pas de crash, pas de
  // rendu brisé.
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-07 : le composant gère un profil sans champs optionnels (robustesse)', () => {
    const minimalProfile = {
      name: 'Étudiant Minimal',
      score: 0,
      title: 'Étudiant',
      school: 'ENSA',
      location: 'Maroc',
      recos: '0',
    }
    let error = null
    const wrapper = mount(StudentProfileHeader, {
      props: { profile: minimalProfile, modelValue: '' },
      global: { config: { errorHandler: (err) => { error = err } } },
    })
    expect(error).toBeNull()
    expect(wrapper.find('.profile-header').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Étudiant Minimal')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // BE-08
  // But : les interactions avec les onglets doivent émettre les bons événements
  // vers le parent (StudentProfileView), qui met à jour activeTab en réponse.
  // C'est l'intégration composant ↔ vue parente.
  // ─────────────────────────────────────────────────────────────────────────
  it('BE-08 : update:modelValue émis correctement lors des interactions onglets', async () => {
    const wrapper = mountWithProfile(BACKEND_PROFILE, { isOwner: true, modelValue: '' })
    // Premier clic → active Modifier bio
    const modifierTab = wrapper.findAll('.tab').find(t => t.text() === 'Modifier bio')
    await modifierTab.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Modifier bio'])

    // Deuxième clic (toggle) → désactive Modifier bio
    await wrapper.setProps({ modelValue: 'Modifier bio' })
    await modifierTab.trigger('click')
    const emissions = wrapper.emitted('update:modelValue')
    expect(emissions[1]).toEqual([''])
  })

})
