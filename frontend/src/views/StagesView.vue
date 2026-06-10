<script setup lang="ts">
import { onMounted, ref } from "vue";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { stageService } from "../services/stage.service";
import studentApi from "../services/studentApi";
import { profileService } from "../services/profile.service";

interface Stage {
  id: number;
  entreprise: string;
  etablissement: string;
  poste: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  competences: string[];
}

interface Professional {
  id: string;
  nom: string;
  entreprise: string;
  poste?: string;
}

const sidebarOpen = ref(true);
const showForm = ref(false);
const stages = ref<Stage[]>([]);
const professionals = ref<Professional[]>([]);
const profileSchool = ref("");

const newStage = ref({
  id_professionnel: "",
  entreprise: "",
  etablissement: "",
  poste: "",
  lieu: "",
  dateDebut: "",
  dateFin: "",
  description: "",
  competences: "",
});

function mapStage(item: any): Stage {
  return {
    id: Number(item?.id_stage),
    entreprise: item?.entreprise || "Entreprise",
    etablissement: item?.etablissement || "",
    poste: item?.poste || "Stage",
    lieu: "",
    dateDebut: item?.date_debut ? String(item.date_debut).slice(0, 7) : "",
    dateFin: item?.date_fin ? String(item.date_fin).slice(0, 7) : "",
    description: item?.missions || "",
    competences: String(item?.technologies || "").split(',').map((c: string) => c.trim()).filter(Boolean),
  };
}

async function loadStages() {
  try {
    const { data } = await stageService.getMesStages();
    const raw = Array.isArray(data?.data) ? data.data : [];
    stages.value = raw.map(mapStage);
  } catch (error) {
    console.warn("Chargement des stages impossible", error);
    stages.value = [];
  }
}

async function loadProfileSchool() {
  try {
    const profile = await profileService.getCurrentUser();
    profileSchool.value = profile.school || "";
    if (!newStage.value.etablissement) {
      newStage.value.etablissement = profileSchool.value;
    }
  } catch (error) {
    console.warn("Chargement de l'etablissement du profil impossible", error);
  }
}

async function loadProfessionals() {
  try {
    const { data } = await studentApi.getProfessionnels();
    professionals.value = Array.isArray(data?.data)
      ? data.data.map((professional) => ({
          id: professional.id,
          nom: professional.nom,
          entreprise: professional.entreprise || "",
          poste: professional.poste || undefined,
        }))
      : [];
  } catch (error) {
    console.warn("Chargement des professionnels impossible", error);
    professionals.value = [];
  }
}

function syncSelectedProfessional() {
  const selected = professionals.value.find(
    (professional) => professional.id === newStage.value.id_professionnel,
  );
  if (selected?.entreprise) {
    newStage.value.entreprise = selected.entreprise;
  }
}

async function ajouterStage() {
  if (!newStage.value.id_professionnel || !newStage.value.entreprise || !newStage.value.poste) return;
  try {
    await stageService.createStage({
      id_professionnel: newStage.value.id_professionnel,
      entreprise: newStage.value.entreprise,
      etablissement: newStage.value.etablissement,
      poste: newStage.value.poste,
      missions: newStage.value.description,
      technologies: newStage.value.competences,
      date_debut: newStage.value.dateDebut ? `${newStage.value.dateDebut}-01` : undefined,
      date_fin: newStage.value.dateFin ? `${newStage.value.dateFin}-01` : undefined,
    });
    newStage.value = {
      id_professionnel: "",
      entreprise: "",
      etablissement: profileSchool.value,
      poste: "",
      lieu: "",
      dateDebut: "",
      dateFin: "",
      description: "",
      competences: "",
    };
    showForm.value = false;
    await loadStages();
  } catch (error) {
    console.warn("Creation du stage impossible", error);
  }
}

async function supprimerStage(id: number) {
  try {
    await stageService.deleteStage(id);
    await loadStages();
  } catch (error) {
    console.warn("Suppression du stage impossible", error);
  }
}

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  const mois = ["", "Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"];
  return `${mois[parseInt(m || "0")]} ${y}`;
}

onMounted(() => {
  loadStages();
  loadProfessionals();
  loadProfileSchool();
});
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
              <label>Professionnel / entreprise *</label>
              <select v-model="newStage.id_professionnel" @change="syncSelectedProfessional">
                <option value="">Choisir un professionnel</option>
                <option
                  v-for="professional in professionals"
                  :key="professional.id"
                  :value="professional.id"
                >
                  {{ professional.entreprise }} - {{ professional.nom }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Poste *</label>
              <input v-model="newStage.poste" placeholder="Ex: Développeur Full Stack" />
            </div>
            <div class="form-group">
              <label>Établissement</label>
              <input v-model="newStage.etablissement" placeholder="Ex: ENSA Tanger" />
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
                <span v-if="stage.etablissement" class="meta-chip">
                  {{ stage.etablissement }}
                </span>
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
  background: var(--input-bg);
  padding-top: 50px;
  font-family: var(--font-body);
}

.shell {
  height: calc(100vh - 50px);
  padding: 14px;
  overflow-y: auto;
  transition: var(--ease);
}

.shellShift {
  padding-left: 234px;
  padding-right: 14px;
}

.content-panel {
  width: 100%;
  max-width: none;
  margin: 0;
  background: #fff;
  border-radius: var(--radius-card);
  box-shadow: 0 4px 24px rgba(17,24,39,0.08);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  border-bottom: 1px solid var(--input-bg);
}

.header-left { display: flex; align-items: center; gap: 14px; }

.header-icon {
  width: 44px; height: 44px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--purple);
}

.panel-title { font-size: 1.25rem; font-weight: 700; color: var(--text-dark); margin: 0; font-family: var(--font-head); }
.panel-subtitle { font-size: 0.78rem; color: var(--text-gray); margin: 2px 0 0; }

.btn-add {
  display: flex; align-items: center; gap: 6px;
  background: var(--purple); color: #fff;
  border: none; border-radius: var(--radius-pill);
  padding: 9px 18px; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: var(--ease);
  font-family: var(--font-head);
}
.btn-add:hover { background: var(--navy-mid); }

.form-card {
  margin: 20px 28px;
  padding: 22px;
  background: rgba(79, 70, 229, 0.04);
  border: 1px solid rgba(79, 70, 229, 0.15);
  border-radius: var(--radius-card);
}
.form-title { font-size: 1rem; font-weight: 700; color: var(--text-dark); margin: 0 0 16px; font-family: var(--font-head); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { margin: 12px 0 0; }
.form-group label { font-size: 0.78rem; font-weight: 600; color: var(--text-gray); font-family: var(--font-head); }
.form-group input,
.form-group select,
.form-group textarea {
  border: 1px solid var(--input-bg);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.85rem;
  color: var(--text-dark);
  background: #fff;
  outline: none;
  resize: vertical;
  font-family: var(--font-body);
  transition: var(--ease);
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.btn-cancel {
  padding: 8px 16px; border-radius: var(--radius-pill); border: 1px solid var(--input-bg);
  background: #fff; color: var(--text-gray); font-size: 0.85rem; cursor: pointer;
  font-family: var(--font-head); transition: var(--ease);
}
.btn-cancel:hover { background: var(--input-bg); }
.btn-save {
  padding: 8px 20px; border-radius: var(--radius-pill); border: none;
  background: var(--purple); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer;
  font-family: var(--font-head); transition: var(--ease);
}
.btn-save:hover { background: var(--navy-mid); }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 20px; color: var(--text-gray); font-size: 0.9rem;
}

.stages-list { padding: 16px 28px 28px; display: flex; flex-direction: column; gap: 14px; }

.stage-card {
  display: flex; gap: 16px;
  padding: 18px;
  border: 1px solid var(--input-bg);
  border-radius: var(--radius-card);
  transition: var(--ease);
}
.stage-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.12); border-color: rgba(79,70,229,0.2); }

.company-logo {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--purple), var(--purple-light));
  color: #fff;
  font-size: 1.2rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-family: var(--font-head);
}

.card-body { flex: 1; min-width: 0; }

.card-header-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 4px;
}

.card-title { font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin: 0; font-family: var(--font-head); }
.card-company { font-size: 0.82rem; color: var(--purple); font-weight: 600; margin: 2px 0 0; }

.btn-delete {
  background: none; border: none; cursor: pointer;
  color: var(--input-bg); padding: 4px;
  border-radius: 6px; transition: var(--ease);
}
.btn-delete:hover { color: var(--error); background: rgba(223,30,33,0.08); }

.card-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.meta-chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--input-bg); color: var(--text-gray);
  font-size: 0.75rem; padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
}

.card-desc { font-size: 0.83rem; color: var(--text-gray); line-height: 1.6; margin: 6px 0 10px; font-family: var(--font-body); }

.skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag {
  background: rgba(79, 70, 229, 0.1); color: var(--purple);
  font-size: 0.72rem; font-weight: 700;
  padding: 3px 10px; border-radius: var(--radius-pill);
  font-family: var(--font-head);
}
</style>
