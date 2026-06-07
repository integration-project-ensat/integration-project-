/**
 * SCRUM-34 — Test Student Profile UI
 *
 * But : vérifier que tous les éléments visuels du profil étudiant
 * sont présents et correctement affichés dans le DOM.
 *
 * Approche : tests composant avec Vitest + @vue/test-utils.
 * Le service profileService est mocké pour simuler les données API.
 *
 * Éléments testés :
 *   UI-01 : Section bannière présente
 *   UI-02 : Zone avatar présente
 *   UI-03 : Nom de l'étudiant affiché
 *   UI-04 : Badge filière affiché
 *   UI-05 : Année d'étude affichée
 *   UI-06 : École affichée avec icône
 *   UI-07 : Puce APOGEE affichée
 *   UI-08 : Puce email affichée
 *   UI-09 : Puce ville affichée
 *   UI-10 : Bio affichée
 *   UI-11 : Bouton GitHub affiché
 *   UI-12 : Badge "vérifié" affiché
 *   UI-13 : Pas de lien LinkedIn si absent du profil
 */

import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

const { mockGetProfile } = vi.hoisted(() => {
  const MOCK = {
    id:          1,
    name:        'Aimad Eddine Slimani',
    email:       'aimad.slimani@etud.ensa.ma',
    apogee:      '21009876',
    field:       'Génie Informatique',
    year:        '3ème année',
    school:      'ENSA — École Nationale des Sciences Appliquées',
    city:        'Marrakech',
    avatar:      null,
    bannerColor: '#1a3c5e',
    bio:         'Étudiant passionné par le développement web et la qualité logicielle.',
    isVerified:  true,
    github:      'https://github.com/slimo777',
    linkedin:    null,
  }
  return { mockGetProfile: vi.fn().mockResolvedValue(MOCK) }
})

vi.mock('@/services/profile.service.js', () => ({
  profileService: { getProfile: mockGetProfile, updateProfile: vi.fn(), uploadAvatar: vi.fn() }
}))

describe('SCRUM-34 — Test Student Profile UI', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // UI-01
  // But : la bannière colorée en haut du profil doit toujours être présente.
  // C'est l'élément visuel principal défini dans SCRUM-137.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-01 : la section bannière est présente dans le DOM', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.banner').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-02
  // But : la zone avatar (avec image ou initiales) doit être présente.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-02 : la zone avatar est présente dans le DOM', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.avatar-wrapper').exists()).toBe(true)
    expect(wrapper.find('.avatar').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-03
  // But : le nom complet de l'étudiant doit être visible après chargement.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-03 : le nom complet de l\'étudiant est affiché', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const name = wrapper.find('.student-name')
    expect(name.exists()).toBe(true)
    expect(name.text()).toBe('Aimad Eddine Slimani')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-04
  // But : le badge filière (ex: "Génie Informatique") doit être affiché
  // dans une pill colorée pour identifier la spécialité de l'étudiant.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-04 : le badge filière est affiché', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const badge = wrapper.find('.field-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Génie Informatique')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-05
  // But : l'année d'étude doit être visible à côté du badge filière.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-05 : l\'année d\'étude est affichée', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.student-field').text()).toContain('3ème année')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-06
  // But : le nom de l'école doit être affiché avec une icône de bâtiment.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-06 : le nom de l\'école est affiché', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const school = wrapper.find('.student-school')
    expect(school.exists()).toBe(true)
    expect(school.text()).toContain('ENSA')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-07
  // But : le numéro APOGEE doit être visible sous forme de puce méta.
  // C'est l'identifiant unique de l'étudiant dans le système universitaire.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-07 : la puce APOGEE est affichée avec le bon numéro', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const chips = wrapper.findAll('.meta-chip')
    const apogeeChip = chips.find(c => c.text().includes('APOGEE'))
    expect(apogeeChip).toBeDefined()
    expect(apogeeChip.text()).toContain('21009876')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-08
  // But : l'adresse email doit être visible dans les méta-puces.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-08 : la puce email est affichée', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const chips = wrapper.findAll('.meta-chip')
    const emailChip = chips.find(c => c.text().includes('@'))
    expect(emailChip).toBeDefined()
    expect(emailChip.text()).toContain('aimad.slimani@etud.ensa.ma')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-09
  // But : la ville doit être affichée si elle est fournie dans le profil.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-09 : la puce ville est affichée', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const chips = wrapper.findAll('.meta-chip')
    const cityChip = chips.find(c => c.text().includes('Marrakech'))
    expect(cityChip).toBeDefined()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-10
  // But : la bio de l'étudiant doit être visible sous les méta-puces.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-10 : la bio de l\'étudiant est affichée', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const bio = wrapper.find('.student-bio')
    expect(bio.exists()).toBe(true)
    expect(bio.text()).toContain('qualité logicielle')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-11
  // But : le bouton GitHub doit être affiché et pointer vers le bon profil.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-11 : le bouton GitHub est affiché avec la bonne URL', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const btn = wrapper.find('.social-btn.github')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('href')).toBe('https://github.com/slimo777')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-12
  // But : le badge vert "vérifié" doit apparaître sur l'avatar pour signaler
  // que le compte a été validé par l'administration.
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-12 : le badge vérifié est visible sur l\'avatar', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.verified-badge').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // UI-13
  // But : si le profil n'a pas de LinkedIn, le bouton ne doit pas s'afficher.
  // Les liens sociaux sont conditionnels (v-if).
  // ─────────────────────────────────────────────────────────────────────────
  it('UI-13 : le bouton LinkedIn est absent si linkedin = null', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.social-btn.linkedin').exists()).toBe(false)
  })

})
