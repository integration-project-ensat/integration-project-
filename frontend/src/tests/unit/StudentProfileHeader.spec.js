/**
 * TESTS UNITAIRES — StudentProfileHeader
 *
 * But : tester le composant StudentProfileHeader de façon isolée.
 * Le service profileService est mocké pour ne pas faire de vraies requêtes HTTP.
 *
 * Ce qu'on teste :
 *   SPH-U-01 : Montage du composant sans erreur
 *   SPH-U-02 : Skeleton visible avant la réponse API
 *   SPH-U-03 : Nom affiché après chargement
 *   SPH-U-04 : Initiales calculées quand pas d'avatar
 *   SPH-U-05 : Badge vérifié visible quand isVerified = true
 *   SPH-U-06 : Badge absent quand isVerified = false
 *   SPH-U-07 : Bio affichée
 *   SPH-U-08 : Lien GitHub présent et correct
 *   SPH-U-09 : Lien LinkedIn absent quand null
 *   SPH-U-10 : Couleur de la bannière appliquée depuis le profil
 */

import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

// ── vi.hoisted : défini AVANT le hoist de vi.mock ──────────────────────────
// vi.mock() est remonté au sommet du fichier par Vitest. Si on définit
// MOCK_PROFILE après vi.mock(), la factory ne peut pas y accéder.
// vi.hoisted() garantit que la valeur est disponible dès le hoist.
const { MOCK_PROFILE, mockGetProfile } = vi.hoisted(() => {
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
  const mockGetProfile = vi.fn().mockResolvedValue(MOCK_PROFILE)
  return { MOCK_PROFILE, mockGetProfile }
})

vi.mock('@/services/profile.service.js', () => ({
  profileService: {
    getProfile:    mockGetProfile,
    updateProfile: vi.fn(),
    uploadAvatar:  vi.fn(),
  }
}))

describe('StudentProfileHeader — Tests Unitaires', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-01
  // But : vérifier que le composant se monte correctement avec un userId.
  // C'est le test de base — si celui-ci échoue, tous les autres échoueront.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-01 : se monte sans erreur avec un userId valide', () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.profile-header').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-02
  // But : pendant le chargement (avant que l'API réponde), le composant
  // affiche un skeleton animé à la place du vrai contenu. Ce pattern
  // évite un écran blanc pendant le chargement.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-02 : affiche le skeleton de chargement avant la réponse API', () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    expect(wrapper.find('.skeleton-name').exists()).toBe(true)
    expect(wrapper.find('.student-name').exists()).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-03
  // But : après que l'API répond, le nom de l'étudiant doit remplacer
  // le skeleton. flushPromises() simule l'attente de toutes les promesses.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-03 : affiche le nom de l\'étudiant après le chargement API', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.student-name').text()).toBe('Aimad Eddine Slimani')
    expect(wrapper.find('.skeleton-name').exists()).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-04
  // But : quand avatar = null, le composant calcule et affiche les initiales
  // du nom ("Aimad Eddine" → "AE"). C'est le fallback visuel de l'avatar.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-04 : affiche les initiales "AE" quand avatar est null', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.avatar-initials').exists()).toBe(true)
    expect(wrapper.find('.avatar-initials').text()).toBe('AE')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-05
  // But : quand isVerified = true, un badge vert apparaît sur l'avatar pour
  // indiquer que le profil a été validé par l'administration.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-05 : affiche le badge vérifié quand isVerified = true', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.verified-badge').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-06
  // But : quand isVerified = false, le badge ne doit PAS apparaître.
  // mockResolvedValueOnce surcharge le mock uniquement pour cet appel.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-06 : n\'affiche pas le badge vérifié quand isVerified = false', async () => {
    mockGetProfile.mockResolvedValueOnce({ ...MOCK_PROFILE, isVerified: false })

    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.verified-badge').exists()).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-07
  // But : la bio de l'étudiant doit être affichée dans le profil.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-07 : affiche la bio de l\'étudiant', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const bio = wrapper.find('.student-bio')
    expect(bio.exists()).toBe(true)
    expect(bio.text()).toContain('passionné')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-08
  // But : quand un lien GitHub est fourni, le bouton doit être visible et
  // pointer vers la bonne URL. target="_blank" est vérifié pour la sécurité.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-08 : affiche le lien GitHub avec la bonne URL', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const githubBtn = wrapper.find('.social-btn.github')
    expect(githubBtn.exists()).toBe(true)
    expect(githubBtn.attributes('href')).toBe('https://github.com/slimo777')
    expect(githubBtn.attributes('target')).toBe('_blank')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-09
  // But : quand linkedin = null, le bouton LinkedIn ne doit PAS apparaître.
  // Les boutons sociaux sont conditionnels avec v-if.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-09 : n\'affiche pas le bouton LinkedIn quand linkedin = null', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    expect(wrapper.find('.social-btn.linkedin').exists()).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-10
  // But : la bannière applique la couleur bannerColor du profil en CSS.
  // Le style est généré dynamiquement via un computed (gradient).
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-10 : la bannière contient la couleur bannerColor du profil', async () => {
    const wrapper = mount(StudentProfileHeader, { props: { userId: 1 } })
    await flushPromises()
    const banner = wrapper.find('.banner')
    // jsdom convertit #1a3c5e en rgb(26, 60, 94) dans le style inline
    const style = banner.attributes('style')
    expect(style).toContain('linear-gradient')
    expect(style).toContain('rgb(26, 60, 94)')
  })

})
