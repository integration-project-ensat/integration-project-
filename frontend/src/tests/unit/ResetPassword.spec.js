// src/tests/unit/ResetPassword.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import ResetPasswordView from '../../views/ResetPasswordView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/reset-password', component: ResetPasswordView },
    { path: '/login',          component: { template: '<div />' } },
  ]
})

describe('ResetPasswordView', () => {

  it('affiche le titre Reinitialiser votre passe', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toBe('Reinitialiser votre passe')
  })

  it('affiche le champ email', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('affiche deux champs mot de passe (mot de passe + confirmation)', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.findAll('input[type="password"]')).toHaveLength(2)
  })

  it('affiche le bouton Envoyer', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('button[type="submit"]').text()).toContain('Envoyer')
  })

  it('affiche une erreur si les champs sont vides', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Veuillez remplir tous les champs')
  })

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    await wrapper.find('input[type="email"]').setValue('test@test.com')
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('motdepasse123')
    await passwords[1].setValue('autremotdepasse')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Le mot de passe ne correspond pas.')
  })

  it('affiche un message de succès avec des identifiants valides', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    await wrapper.find('input[type="email"]').setValue('test@test.com')
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('nouveaumotdepasse123')
    await passwords[1].setValue('nouveaumotdepasse123')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.success').text()).toBe('Mot de passe réinitialisé !')
  })

})
