import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import SignupView from '../../views/SignupView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/signup', component: SignupView }]
})

let wrapper

beforeEach(async () => {
  router.push('/signup')
  await router.isReady()

  wrapper = mount(SignupView, {
    global: {
      plugins: [router]
    }
  })
})

describe('SignupView', () => {

  it("affiche le titre S'inscrire", () => {
    expect(wrapper.find('h1').exists()).toBe(true)
  })

  it('affiche le dropdown de rôle', () => {
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('affiche les champs étudiant quand rôle = student', async () => {
    await wrapper.find('select').setValue('student')
    expect(wrapper.find('input[placeholder="APOGEE"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Filière"]').exists()).toBe(true)
  })

  it('affiche les champs prof quand rôle = Prof', async () => {
    await wrapper.find('select').setValue('Prof')
    expect(wrapper.find('input[placeholder="Département"]').exists()).toBe(true)
  })

  it('affiche erreur si champs vides', async () => {
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.err').exists()).toBe(true)
  })
})