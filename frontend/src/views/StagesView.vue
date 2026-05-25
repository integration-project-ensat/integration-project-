<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";

interface Stage {
  id: number;
  entreprise: string;
  poste: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  competences: string[];
}

const sidebarOpen = ref(true);
const showForm = ref(false);

const stages = ref<Stage[]>([
  {
    id: 1,
    entreprise: "OCP Group",
    poste: "Développeur Full Stack",
    lieu: "Casablanca, Maroc",
    dateDebut: "2025-07",
    dateFin: "2025-09",
    description:
      "Développement d'une application interne de gestion des ressources humaines avec Vue 3 et Node.js.",
    competences: ["Vue 3", "Node.js", "PostgreSQL", "Docker"],
  },
]);

const newStage = ref({
  entreprise: "",
  poste: "",
  lieu: "",
  dateDebut: "",
  dateFin: "",
  description: "",
  competences: "",
});

function ajouterStage() {
  if (!newStage.value.entreprise || !newStage.value.poste) return;
  stages.value.push({
    id: Date.now(),
    entreprise: newStage.value.entreprise,
    poste: newStage.value.poste,
    lieu: newStage.value.lieu,
    dateDebut: newStage.value.dateDebut,
    dateFin: newStage.value.dateFin,
    description: newStage.value.description,
    competences: newStage.value.competences
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
  });
  newStage.value = {
    entreprise: "",
    poste: "",
    lieu: "",
    dateDebut: "",
    dateFin: "",
    description: "",
    competences: "",
  };
  showForm.value = false;
}

function supprimerStage(id: number) {
  stages.value = stages.value.filter((s) => s.id !== id);
}

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  const mois = [
    "", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];
  return `${mois[parseInt(m)]} ${y}`;
}
</script>

<template>
  <div class="page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <Sidebar :isOpen="sidebarOpen" />

    <div class="shell" :class="{ shellShift: sidebarOpen }">
      <div class="content-panel">

        <!-- En-tête -->
        <div class="panel-header">
          <div class="header-left">
            <div class="header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            <div>
              <h1 class="panel-title">Stages</h1>
              <p class="panel-subtitle">{{ stages.length }} stage{{ stages.length > 1 ? 's' : '' }} enregistré{{ stages.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
          <button class="btn-add" @click="showForm = !showForm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter un stage
          </button>
        </div>

        <!-- Formulaire d'ajout -->
        <div v-if="showForm" class="form-card">
          <h2 class="form-title">Nouveau stage</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Entreprise *</label>
              <input v-model="newStage.entreprise" placeholder="Ex: Google, OCP, Maroc Telecom..." />
            </div>
            <div class="form-group">
              <label>Poste *</label>
              <input v-model="newStage.poste" placeholder="Ex: Développeur Full Stack" />
            </div>
            <div class="form-group">
              <label>Lieu</label>
              <input v-model="newStage.lieu" placeholder="Ex: Casablanca, Maroc" />
            </div>
            <div class="form-group">
              <label>Compétences acquises</label>
              <input v-model="newStage.competences" placeholder="Ex: Vue 3, Python, Docker (séparées par des virgules)" />
            </div>
            <div class="form-group">
              <label>Date de début</label>
              <input type="month" v-model="newStage.dateDebut" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input type="month" v-model="newStage.dateFin" />
            </div>
          </div>
          <div class="form-group full">
            <label>Description</label>
            <textarea v-model="newStage.description" placeholder="Décrivez vos missions et réalisations..." rows="3" />
          </div>
          <div class="form-actions">
            <button class="btn-cancel" @click="showForm = false">Annuler</button>
            <button class="btn-save" @click="ajouterStage">Enregistrer</button>
          </div>
        </div>

        <!-- Liste des stages -->
        <div v-if="stages.length === 0 && !showForm" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0c8d8" stroke-width="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          </svg>
          <p>Aucun stage enregistré pour le moment.</p>
          <button class="btn-add" @click="showForm = true">Ajouter votre premier stage</button>
        </div>

        <div class="stages-list">
          <div v-for="stage in stages" :key="stage.id" class="stage-card">
            <div class="card-left">
              <div class="company-logo">{{ stage.entreprise.charAt(0) }}</div>
            </div>
            <div class="card-body">
              <div class="card-header-row">
                <div>
                  <h3 class="card-title">{{ stage.poste }}</h3>
                  <p class="card-company">{{ stage.entreprise }}</p>
                </div>
                <button class="btn-delete" @click="supprimerStage(stage.id)" title="Supprimer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
              <div class="card-meta">
                <span v-if="stage.lieu" class="meta-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ stage.lieu }}
                </span>
                <span v-if="stage.dateDebut" class="meta-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatDate(stage.dateDebut) }} – {{ stage.dateFin ? formatDate(stage.dateFin) : 'En cours' }}
                </span>
              </div>
              <p v-if="stage.description" class="card-desc">{{ stage.description }}</p>
              <div v-if="stage.competences.length" class="skills-row">
                <span v-for="skill in stage.competences" :key="skill" class="skill-tag">{{ skill }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #eef1fb;
  padding-top: 50px;
}

.shell {
  height: calc(100vh - 50px);
  padding: 20px;
  overflow-y: auto;
  transition: padding-left 0.3s ease;
}

.shellShift { padding-left: 238px; }

.content-panel {
  max-width: 820px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(15,23,42,0.08);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  border-bottom: 1px solid #f0f2f8;
}

.header-left { display: flex; align-items: center; gap: 14px; }

.header-icon {
  width: 44px; height: 44px;
  background: #eeecff;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #6c5ce7;
}

.panel-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
.panel-subtitle { font-size: 0.78rem; color: #64748b; margin: 2px 0 0; }

.btn-add {
  display: flex; align-items: center; gap: 6px;
  background: #6c5ce7; color: #fff;
  border: none; border-radius: 10px;
  padding: 9px 16px; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.btn-add:hover { background: #5a4bd1; }

/* Formulaire */
.form-card {
  margin: 20px 28px;
  padding: 22px;
  background: #f8f9ff;
  border: 1px solid #e8e4ff;
  border-radius: 14px;
}
.form-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { margin: 12px 0 0; }
.form-group label { font-size: 0.78rem; font-weight: 600; color: #475569; }
.form-group input,
.form-group textarea {
  border: 1px solid #dde1ef;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.85rem;
  color: #0f172a;
  background: #fff;
  outline: none;
  resize: vertical;
  font-family: inherit;
}
.form-group input:focus,
.form-group textarea:focus { border-color: #6c5ce7; box-shadow: 0 0 0 3px rgba(108,92,231,0.12); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.btn-cancel {
  padding: 8px 16px; border-radius: 8px; border: 1px solid #dde1ef;
  background: #fff; color: #64748b; font-size: 0.85rem; cursor: pointer;
}
.btn-save {
  padding: 8px 20px; border-radius: 8px; border: none;
  background: #6c5ce7; color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.btn-save:hover { background: #5a4bd1; }

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 20px; color: #94a3b8; font-size: 0.9rem;
}

/* Liste */
.stages-list { padding: 16px 28px 28px; display: flex; flex-direction: column; gap: 14px; }

.stage-card {
  display: flex; gap: 16px;
  padding: 18px;
  border: 1px solid #eef0f8;
  border-radius: 14px;
  transition: box-shadow 0.2s;
}
.stage-card:hover { box-shadow: 0 4px 16px rgba(108,92,231,0.1); }

.company-logo {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: #fff;
  font-size: 1.2rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.card-body { flex: 1; min-width: 0; }

.card-header-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 4px;
}

.card-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; }
.card-company { font-size: 0.82rem; color: #6c5ce7; font-weight: 600; margin: 2px 0 0; }

.btn-delete {
  background: none; border: none; cursor: pointer;
  color: #cbd5e1; padding: 4px;
  border-radius: 6px; transition: color 0.2s, background 0.2s;
}
.btn-delete:hover { color: #e53e3e; background: #fff1f1; }

.card-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.meta-chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: #f0f4ff; color: #475569;
  font-size: 0.75rem; padding: 3px 9px;
  border-radius: 20px;
}

.card-desc { font-size: 0.83rem; color: #64748b; line-height: 1.6; margin: 6px 0 10px; }

.skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag {
  background: #eeecff; color: #6c5ce7;
  font-size: 0.72rem; font-weight: 600;
  padding: 3px 10px; border-radius: 20px;
}
</style>
