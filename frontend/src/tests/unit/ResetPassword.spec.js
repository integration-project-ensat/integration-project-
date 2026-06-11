// src/tests/unit/ResetPassword.spec.js
import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, afterEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import MockAdapter from 'axios-mock-adapter'
import api from '../../services/api.js'
import ResetPasswordView from '../../views/ResetPasswordView.vue'

const mock = new MockAdapter(api)

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/reset-password', component: ResetPasswordView },
    { path: '/login',          component: { template: '<div />' } },
    { path: '/forgot',         component: { template: '<div />' } },
  ],
})

// Monte le composant avec un token valide + API mockée pour l'email
async function mountWithToken() {
  mock.onGet(/verifier-token-reset/).reply(200, { data: { email: 'test@test.com' } })
  await router.push('/reset-password?token=valid-test-token')
  const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('ResetPasswordView', () => {

  afterEach(() => {
    mock.reset()
  })

  it('affiche le titre Réinitialiser votre mot de passe', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPasswordView, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toBe('Réinitialiser votre mot de passe')
  })

  it('affiche le champ email', async () => {
    const wrapper = await mountWithToken()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('affiche deux champs mot de passe (mot de passe + confirmation)', async () => {
    const wrapper = await mountWithToken()
    expect(wrapper.findAll('input[type="password"]')).toHaveLength(2)
  })

  it('affiche le bouton Réinitialiser', async () => {
    const wrapper = await mountWithToken()
    expect(wrapper.find('button[type="submit"]').text()).toContain('Réinitialiser')
  })

  it('affiche une erreur si les champs sont vides', async () => {
    const wrapper = await mountWithToken()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Veuillez remplir tous les champs')
  })

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    const wrapper = await mountWithToken()
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('motdepasse123')
    await passwords[1].setValue('autremotdepasse')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Les mots de passe ne correspondent pas.')
  })

  it('affiche un message de succès avec des identifiants valides', async () => {
    mock.onPost('/auth/reinitialiser-mot-de-passe').reply(200, {})
    const wrapper = await mountWithToken()
    const passwords = wrapper.findAll('input[type="password"]')
    await passwords[0].setValue('nouveaumotdepasse123')
    await passwords[1].setValue('nouveaumotdepasse123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.success').text()).toBe('Mot de passe réinitialisé avec succès !')
  })

})
