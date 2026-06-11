/**
 * TESTS D'INTÉGRATION — StudentProfileView ↔ StudentProfileHeader (v2)
 *
 * But : tester que StudentProfileView et StudentProfileHeader fonctionnent
 * correctement ensemble — données du profil, onglets, événements.
 *
 * Approche : mount complet de StudentProfileView avec TopBar/SideBar/PostCard
 * stubés. Le flux réel View → Header → DOM est testé.
 *
 * INT-SP-01 : StudentProfileView rend le composant StudentProfileHeader
 * INT-SP-02 : Le profil avec un nom valide est transmis au header
 * INT-SP-03 : isOwner=true est transmis (mode propriétaire)
 * INT-SP-04 : Le nom du profil est visible dans le DOM de la vue
 * INT-SP-05 : Les onglets owner (Modifier bio, Partager) sont visibles
 * INT-SP-06 : Clic Modifier bio affiche les sections d'édition du profil
 * INT-SP-07 : L'événement avatar-changed met à jour le profil dans la vue
 * INT-SP-08 : Double clic sur Modifier bio masque les sections d'édition
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StudentProfileView from '@/views/StudentProfileView.vue'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return { ...actual, useRouter: vi.fn(() => ({ push: vi.fn() })) }
})

const GLOBAL_CONFIG = {
  stubs: {
    TopBar: { template: '<div class="topbar-stub" />' },
    SideBar: { template: '<div class="sidebar-stub" />' },
    PostCard: { template: '<div class="postcard-stub" />' },
  },
}

function mountView() {
  return mount(StudentProfileView, { global: GLOBAL_CONFIG })
}

describe('Intégration : StudentProfileView ↔ StudentProfileHeader', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-01
  // But : vérifier que StudentProfileView inclut bien StudentProfileHeader
  // dans son arbre DOM — test de base de l'intégration des deux fichiers.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-01 : StudentProfileView rend le composant StudentProfileHeader', () => {
    const wrapper = mountView()
    expect(wrapper.findComponent(StudentProfileHeader).exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-02
  // But : le profil (objet réactif de la vue) doit être transmis comme prop
  // au composant header. Sans cette transmission, rien ne s'affiche.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-02 : le profil avec un nom valide est transmis au header', () => {
    const wrapper = mountView()
    const profile = wrapper.findComponent(StudentProfileHeader).props('profile')
    expect(profile).toBeDefined()
    expect(typeof profile.name).toBe('string')
    expect(profile.name.length).toBeGreaterThan(0)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-03
  // But : isOwner=true est transmis au header — c'est ce qui active le mode
  // édition (overlays avatar/bannière, onglets Modifier bio).
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-03 : isOwner=true est transmis au header (mode propriétaire)', () => {
    const wrapper = mountView()
    expect(wrapper.findComponent(StudentProfileHeader).props('isOwner')).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-04
  // But : end-to-end du flux vue → header → DOM.
  // Le nom du profil doit remonter jusqu'au h1 visible dans la page.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-04 : le nom du profil est visible dans le DOM de la vue', () => {
    const wrapper = mountView()
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h1').text().length).toBeGreaterThan(0)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-05
  // But : puisque isOwner=true, seuls les onglets "Modifier bio" et "Partager"
  // doivent apparaître — les onglets de visite (Portfolio, Recommander…) non.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-05 : les onglets owner (Modifier bio, Partager) sont visibles', () => {
    const wrapper = mountView()
    const tabTexts = wrapper.findAll('.tab').map(t => t.text())
    expect(tabTexts).toContain('Modifier bio')
    expect(tabTexts).toContain('Partager')
    expect(tabTexts).toHaveLength(2)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-06
  // But : cliquer sur l'onglet Modifier bio doit mettre à jour activeTab dans
  // la vue via update:modelValue → les sections d'édition doivent apparaître.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-06 : clic Modifier bio affiche les sections d\'édition du profil', async () => {
    const wrapper = mountView()
    expect(wrapper.find('.profile-edit-sections').exists()).toBe(false)
    const modifierTab = wrapper.findAll('.tab').find(t => t.text() === 'Modifier bio')
    await modifierTab.trigger('click')
    expect(wrapper.find('.profile-edit-sections').exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-07
  // But : quand le header émet avatar-changed, la vue doit mettre à jour
  // profile.avatar via son handler @avatar-changed. Teste la réactivité
  // de bout en bout : événement composant → mise à jour du profil parent.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-07 : l\'événement avatar-changed met à jour le profil dans la vue', async () => {
    const wrapper = mountView()
    const header = wrapper.findComponent(StudentProfileHeader)
    await header.vm.$emit('avatar-changed', 'data:image/png;base64,fakedata')
    await wrapper.vm.$nextTick()
    expect(header.props('profile').avatar).toBe('data:image/png;base64,fakedata')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-SP-08
  // But : le double clic sur Modifier bio doit masquer les sections d'édition
  // (comportement de toggle). Vérifie que la logique d'émission et la v-model
  // de la vue fonctionnent correctement dans les deux sens.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-SP-08 : double clic sur Modifier bio masque les sections d\'édition', async () => {
    const wrapper = mountView()
    const modifierTab = wrapper.findAll('.tab').find(t => t.text() === 'Modifier bio')
    await modifierTab.trigger('click')
    expect(wrapper.find('.profile-edit-sections').exists()).toBe(true)
    await modifierTab.trigger('click')
    expect(wrapper.find('.profile-edit-sections').exists()).toBe(false)
  })

})
