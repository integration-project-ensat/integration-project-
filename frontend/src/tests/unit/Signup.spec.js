import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import SignupView from '../../views/SignupView.vue'

vi.mock('../../components/AuthLayout.vue', () => ({
  default: {
    template: '<div><slot /></div>'
  }
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/signup', component: SignupView },
    { path: '/login', component: { template: '<div/>' } }
  ]
})

describe('SignupView', () => {
  it('affiche le titre S\'inscrire', async () => {
    const wrapper = mount(SignupView, {
      global: { plugins: [router] }
    })
    await router.isReady()
    expect(wrapper.find('h1').text()).toBe("S'inscrire")
  })

  it('affiche le dropdown de rôle', async () => {
    const wrapper = mount(SignupView, {
      global: { plugins: [router] }
    })
    await router.isReady()
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('affiche les champs étudiant quand rôle = student', async () => {
    const wrapper = mount(SignupView, {
      global: { plugins: [router] }
    })
    await router.isReady()
    await wrapper.find('select').setValue('student')
    expect(wrapper.find('input[placeholder="APOGEE"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Filière"]').exists()).toBe(true)
  })

  it('affiche les champs prof quand rôle = Prof', async () => {
    const wrapper = mount(SignupView, {
      global: { plugins: [router] }
    })
    await router.isReady()
    await wrapper.find('select').setValue('Prof')
    expect(wrapper.find('input[placeholder="Département"]').exists()).toBe(true)
  })

  it('affiche erreur si champs vides', async () => {
    const wrapper = mount(SignupView, {
      global: { plugins: [router] }
    })
    await router.isReady()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').text()).toBe('Veuillez remplir tous les champs')
  })
})