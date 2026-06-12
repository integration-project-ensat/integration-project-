// src/tests/unit/Login.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../../views/LoginView.vue'

// mock AuthLayout pour éviter les erreurs de composant enfant
vi.mock('../../components/AuthLayout.vue', () => ({
  default: {
    template: '<div><slot /></div>'
  }
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/login', component: LoginView }]
})

describe('LoginView', () => {
  it('affiche le titre Bienvenue', () => {
    const wrapper = mount(LoginView, {
      global: { plugins: [router] }
    })
    expect(wrapper.find('h1').text()).toBe('Bienvenue')
  })

  it('affiche le champ email', () => {
    const wrapper = mount(LoginView, {
      global: { plugins: [router] }
    })
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('affiche le champ mot de passe', () => {
    const wrapper = mount(LoginView, {
      global: { plugins: [router] }
    })
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('affiche erreur si champs vides', async () => {
    const wrapper = mount(LoginView, {
      global: { plugins: [router] }
    })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Champs requis')
  })

  it('affiche le lien s\'inscrire', () => {
    const wrapper = mount(LoginView, {
      global: { plugins: [router] }
    })
    expect(wrapper.find('.switch a').text()).toContain('inscrire')
  })
})