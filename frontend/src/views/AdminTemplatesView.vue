<script setup>
import { ref, onMounted } from 'vue'
import { adminTemplateService } from '../services/adminTemplate.service'

const templates = ref([])

onMounted(async () => {
  templates.value = await adminTemplateService.getAll()
  
})
const supprimer = async (id) => {
  await adminTemplateService.delete(id)

  templates.value = templates.value.filter(
    t => t.id_modele !== id
  )
}
const newTemplate = ref({
  nom: '',
  theme: '',
  sections: ''
})
const ajouter = async () => {
  const created = await adminTemplateService.create({
    nom: newTemplate.value.nom,
    theme: newTemplate.value.theme,
    sections: newTemplate.value.sections
  })

  templates.value.push(created)

  newTemplate.value = {
    nom: '',
    theme: '',
    sections: ''
  }
}
</script>

<template>
  <div class="container">

    <h1>Templates Portfolio</h1>

    <!-- FORMULAIRE -->
    <div>
      <h2>Nouveau Template</h2>

      <input v-model="newTemplate.nom" placeholder="Nom">

      <input v-model="newTemplate.theme" placeholder="Theme">

      <input
        v-model="newTemplate.sections"
        placeholder="about,skills,projects"
      >

      <button @click="ajouter">
        Ajouter
      </button>
    </div>

    <!-- LISTE -->
    <div
      v-for="template in templates"
      :key="template.id_modele"
    >
      <h3>{{ template.nom }}</h3>

      <p>
        <strong>Theme :</strong>
        {{ template.theme }}
      </p>

      <p>
        <strong>Sections :</strong>
        {{ template.sections }}
      </p>

      <button @click="supprimer(template.id_modele)">
        Supprimer
      </button>
    </div>

  </div>
</template>