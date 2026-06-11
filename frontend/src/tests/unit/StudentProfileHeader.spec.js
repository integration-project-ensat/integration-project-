/**
 * TESTS UNITAIRES — StudentProfileHeader (v2)
 *
 * Le composant reçoit un objet `profile` en prop — aucun appel service interne.
 * Émets : update:modelValue, open-recos, avatar-changed, banner-changed
 *
 * SPH-U-01 : Montage sans erreur avec profil valide
 * SPH-U-02 : Nom affiché dans le h1
 * SPH-U-03 : Titre de filière affiché dans .title
 * SPH-U-04 : École affichée dans .school
 * SPH-U-05 : Initiales calculées et affichées quand pas d'avatar
 * SPH-U-06 : Image avatar affichée quand avatar fourni
 * SPH-U-07 : Owner voit 2 onglets (Modifier bio + Partager)
 * SPH-U-08 : Non-owner voit 6 onglets dont Portfolio
 * SPH-U-09 : Clic Modifier bio émet update:modelValue avec toggle
 * SPH-U-10 : Banner-edit-overlay visible pour l'owner, absent sinon
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return { ...actual, useRouter: vi.fn(() => ({ push: vi.fn() })) }
})

const BASE_PROFILE = {
  name: 'Aimad Eddine Slimani',
  score: 500,
  title: 'Étudiant en Génie Informatique',
  school: 'ENSA Marrakech',
  location: 'Marrakech',
  recos: '12',
  bio: 'Passionné par le développement web.',
  email: 'aimad@test.com',
}

function mountHeader(props = {}) {
  return mount(StudentProfileHeader, {
    props: { profile: BASE_PROFILE, modelValue: '', ...props },
  })
}

describe('StudentProfileHeader — Tests Unitaires', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-01
  // But : vérifier que le composant se monte sans erreur avec un profil valide.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-01 : se monte sans erreur avec un profil valide', () => {
    const wrapper = mountHeader()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.profile-header').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-02
  // But : le nom complet doit être affiché dans le h1 (titre sémantique).
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-02 : affiche le nom de l\'étudiant dans le h1', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('h1').text()).toBe('Aimad Eddine Slimani')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-03
  // But : le titre de la filière doit être visible dans .title.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-03 : affiche le titre de la filière dans .title', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.title').text()).toContain('Génie Informatique')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-04
  // But : l'école doit être affichée dans .school.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-04 : affiche l\'école dans .school', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.school').text()).toContain('ENSA')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-05
  // But : quand avatar est absent, les initiales "AE" sont calculées et affichées.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-05 : affiche les initiales "AE" quand avatar absent', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.avatar img').exists()).toBe(false)
    expect(wrapper.find('.avatar span').text()).toBe('AE')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-06
  // But : quand un avatar URL est fourni, l'image doit s'afficher.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-06 : affiche l\'image avatar quand avatar est fourni', () => {
    const wrapper = mountHeader({
      profile: { ...BASE_PROFILE, avatar: 'https://example.com/avatar.jpg' },
    })
    expect(wrapper.find('.avatar img').exists()).toBe(true)
    expect(wrapper.find('.avatar img').attributes('src')).toBe('https://example.com/avatar.jpg')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-07
  // But : l'owner voit seulement 2 onglets d'édition — modification et partage.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-07 : l\'owner voit seulement Modifier bio et Partager', () => {
    const wrapper = mountHeader({ isOwner: true })
    const tabTexts = wrapper.findAll('.tab').map(t => t.text())
    expect(tabTexts).toEqual(['Modifier bio', 'Partager'])
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-08
  // But : le non-owner voit les 6 onglets de navigation du profil.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-08 : le non-owner voit 6 onglets dont Portfolio', () => {
    const wrapper = mountHeader({ isOwner: false })
    const tabTexts = wrapper.findAll('.tab').map(t => t.text())
    expect(tabTexts).toHaveLength(6)
    expect(tabTexts).toContain('Portfolio')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-09
  // But : un clic sur Modifier bio (quand inactif) doit émettre la valeur
  // 'Modifier bio' via update:modelValue (logique de toggle).
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-09 : clic Modifier bio émet update:modelValue avec "Modifier bio"', async () => {
    const wrapper = mountHeader({ isOwner: true, modelValue: '' })
    const tab = wrapper.findAll('.tab').find(t => t.text() === 'Modifier bio')
    await tab.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Modifier bio'])
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SPH-U-10
  // But : le overlay de modification de bannière est visible uniquement pour
  // l'owner — c'est le verrou visuel qui protège l'édition.
  // ─────────────────────────────────────────────────────────────────────────
  it('SPH-U-10 : banner-edit-overlay visible pour l\'owner, absent pour le non-owner', () => {
    const ownerWrapper = mountHeader({ isOwner: true })
    const guestWrapper = mountHeader({ isOwner: false })
    expect(ownerWrapper.find('.banner-edit-overlay').exists()).toBe(true)
    expect(guestWrapper.find('.banner-edit-overlay').exists()).toBe(false)
  })

})
