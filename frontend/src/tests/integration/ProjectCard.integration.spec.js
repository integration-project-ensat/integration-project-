/**
 * TESTS D'INTÉGRATION — ProjectCard ↔ ValidationStatus
 *
 * But : vérifier que le composant ProjectCard et le composant enfant
 * ValidationStatus fonctionnent correctement ensemble.
 *
 * Différence avec les tests unitaires :
 *   - Tests unitaires  → chaque composant isolé, enfants simulés (stubs)
 *   - Tests d'intégration → les vrais composants, montés ensemble, avec
 *     des flux de données réels entre parent et enfant.
 *
 * Ce qu'on teste ici :
 *   1. ProjectCard inclut bien ValidationStatus dans son rendu
 *   2. La prop `status` du projet est transmise et affichée correctement
 *   3. Une liste de ProjectCards affiche chaque statut correctement
 *   4. Une mise à jour de prop se propage jusqu'à l'affichage du badge
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ProjectCard     from '@/components/ProjectCard.vue'
import ValidationStatus from '@/components/ValidationStatus.vue'

describe('Intégration : ProjectCard ↔ ValidationStatus', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // INT-PC-01
  // But : s'assurer que ProjectCard rend bien ValidationStatus à l'intérieur
  // de son arbre DOM.  Si ce test échoue, c'est que ProjectCard n'importe
  // pas ou n'utilise pas ValidationStatus.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-PC-01 : ProjectCard rend le composant ValidationStatus en tant qu\'enfant', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: { title: 'Mon Projet', status: 'pending' } }
    })
    expect(wrapper.findComponent(ValidationStatus).exists()).toBe(true)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-PC-02
  // But : vérifier le flux de données parent → enfant pour le statut "pending".
  // ProjectCard reçoit la prop, la transmet à ValidationStatus, qui affiche
  // "En attente". Ce test vérifie toute la chaîne de communication.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-PC-02 : statut "pending" → ValidationStatus affiche "En attente"', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: { title: 'Projet A', status: 'pending' } }
    })
    expect(wrapper.findComponent(ValidationStatus).text()).toContain('En attente')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-PC-03
  // But : même flux pour le statut "approved" → "Approuvé".
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-PC-03 : statut "approved" → ValidationStatus affiche "Approuvé"', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: { title: 'Projet B', status: 'approved' } }
    })
    expect(wrapper.findComponent(ValidationStatus).text()).toContain('Approuvé')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-PC-04
  // But : même flux pour le statut "rejected" → "Rejeté".
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-PC-04 : statut "rejected" → ValidationStatus affiche "Rejeté"', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: { title: 'Projet C', status: 'rejected' } }
    })
    expect(wrapper.findComponent(ValidationStatus).text()).toContain('Rejeté')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-PC-05
  // But : tester que plusieurs ProjectCards dans un composant liste affichent
  // chacun leur propre badge de statut correctement.
  // On crée un composant wrapper qui itère v-for sur une liste de projets.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-PC-05 : une liste de 3 ProjectCards affiche 3 badges de statut distincts', () => {
    const projects = [
      { title: 'Projet 1', status: 'pending'  },
      { title: 'Projet 2', status: 'approved' },
      { title: 'Projet 3', status: 'rejected' }
    ]

    const ListeProjects = {
      template: `<div><ProjectCard v-for="p in projects" :key="p.title" :project="p" /></div>`,
      components: { ProjectCard },
      props: ['projects']
    }

    const wrapper = mount(ListeProjects, { props: { projects } })

    const cards = wrapper.findAllComponents(ProjectCard)
    expect(cards).toHaveLength(3)
    expect(cards[0].text()).toContain('En attente')
    expect(cards[1].text()).toContain('Approuvé')
    expect(cards[2].text()).toContain('Rejeté')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-PC-06
  // But : vérifier la réactivité — quand on met à jour la prop `project`
  // d'un ProjectCard déjà monté, le badge ValidationStatus doit se mettre
  // à jour automatiquement (réactivité Vue).
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-PC-06 : mise à jour de la prop status met à jour le badge en temps réel', async () => {
    const wrapper = mount(ProjectCard, {
      props: { project: { title: 'Projet Test', status: 'pending' } }
    })
    expect(wrapper.findComponent(ValidationStatus).text()).toContain('En attente')

    await wrapper.setProps({ project: { title: 'Projet Test', status: 'approved' } })

    expect(wrapper.findComponent(ValidationStatus).text()).toContain('Approuvé')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // INT-PC-07
  // But : vérifier que le titre du projet est toujours visible même quand
  // ValidationStatus est présent — s'assurer qu'il n'y a pas de conflit
  // d'affichage entre les deux zones du composant.
  // ─────────────────────────────────────────────────────────────────────────
  it('INT-PC-07 : le titre et le badge ValidationStatus sont tous les deux visibles', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: { title: 'Portfolio IA', status: 'approved' } }
    })
    expect(wrapper.find('h1').text()).toBe('Portfolio IA')
    expect(wrapper.findComponent(ValidationStatus).exists()).toBe(true)
  })

})
