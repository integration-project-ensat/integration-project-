// src/tests/unit/VerifyCode.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import VerifyCodeView from '../../views/VerifyCodeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/verify-code',    component: VerifyCodeView },
    { path: '/reset-password', component: { template: '<div />' } },
    { path: '/login',          component: { template: '<div />' } },
  ]
})

// On utilise de faux timers pour ne pas attendre 60 secondes à chaque test
vi.useFakeTimers()

afterEach(() => {
  vi.clearAllTimers()
})

describe('VerifyCodeView', () => {

  it('affiche le titre Vérifier votre e-mail', async () => {
    await router.push('/verify-code')
    const wrapper = mount(VerifyCodeView, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toBe('Vérifier votre e-mail')
  })

  it('affiche exactement 6 cases de saisie de code', async () => {
    await router.push('/verify-code')
    const wrapper = mount(VerifyCodeView, { global: { plugins: [router] } })
    expect(wrapper.findAll('.code-box')).toHaveLength(6)
  })

  it('le bouton Vérifier est désactivé si le code est incomplet', async () => {
    await router.push('/verify-code')
    const wrapper = mount(VerifyCodeView, { global: { plugins: [router] } })
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('affiche une erreur si le formulaire est soumis avec un code incomplet', async () => {
    await router.push('/verify-code')
    const wrapper = mount(VerifyCodeView, { global: { plugins: [router] } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Entrez le code complet')
  })

  it('le bouton Renvoyer est désactivé pendant le countdown de 60s', async () => {
    await router.push('/verify-code')
    const wrapper = mount(VerifyCodeView, { global: { plugins: [router] } })
    expect(wrapper.find('.resend-btn').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.resend-btn').text()).toContain('Renvoyer dans')
  })

  it('le bouton Renvoyer devient actif après la fin du countdown', async () => {
    await router.push('/verify-code')
    const wrapper = mount(VerifyCodeView, { global: { plugins: [router] } })
    vi.advanceTimersByTime(61000) // avance de 61 secondes
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.resend-btn').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('.resend-btn').text()).toBe('Renvoyer')
  })

  it('affiche le lien Retour à la connexion', async () => {
    await router.push('/verify-code')
    const wrapper = mount(VerifyCodeView, { global: { plugins: [router] } })
    expect(wrapper.find('.back').text()).toContain('connexion')
  })

})
