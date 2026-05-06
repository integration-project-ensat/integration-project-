// src/tests/unit/ForgetPassword.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import ForgetPasswordView from '../../views/ForgetPasswordView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/forgot',        component: ForgetPasswordView },
    { path: '/verify-code',   component: { template: '<div />' } },
    { path: '/login',         component: { template: '<div />' } },
  ]
})

describe('ForgetPasswordView', () => {

  it('affiche le titre Mot de passe oublie?', async () => {
    await router.push('/forgot')
    const wrapper = mount(ForgetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toBe('Mot de passe oublie?')
  })

  it('affiche un champ email', async () => {
    await router.push('/forgot')
    const wrapper = mount(ForgetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('affiche le bouton Envoyer', async () => {
    await router.push('/forgot')
    const wrapper = mount(ForgetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('button[type="submit"]').text()).toContain('Envoyer')
  })

  it('affiche une erreur si le champ email est vide', async () => {
    await router.push('/forgot')
    const wrapper = mount(ForgetPasswordView, { global: { plugins: [router] } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Nous ne trouvons pas votre e-mail.')
  })

  it('affiche une erreur pour un email sans arobase', async () => {
    await router.push('/forgot')
    const wrapper = mount(ForgetPasswordView, { global: { plugins: [router] } })
    await wrapper.find('input[type="email"]').setValue('emailsansarobas')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Nous ne trouvons pas votre e-mail.')
  })

  it('affiche le lien Retour a se connecter', async () => {
    await router.push('/forgot')
    const wrapper = mount(ForgetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('.back').text()).toContain('connecter')
  })

})
