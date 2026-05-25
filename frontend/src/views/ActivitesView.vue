<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";

interface Activite {
  id: number;
  titre: string;
  organisation: string;
  categorie: "sport" | "culturel" | "associatif" | "benevolat" | "autre";
  dateDebut: string;
  dateFin?: string;
  description: string;
}

const sidebarOpen = ref(true);
const showForm = ref(false);

const categorieLabels: Record<Activite["categorie"], string> = {
  sport: "Sport",
  culturel: "Culturel",
  associatif: "Associatif",
  benevolat: "Bénévolat",
  autre: "Autre",
};

const categorieColors: Record<Activite["categorie"], string> = {
  sport: "#f59e0b",
  culturel: "#8b5cf6",
  associatif: "#0ea5e9",
  benevolat: "#10b981",
  autre: "#64748b",
};

const activites = ref<Activite[]>([
  {
    id: 1,
    titre: "Capitaine équipe de football",
    organisation: "ENSA Tanger",
    categorie: "sport",
    dateDebut: "2023-09",
    dateFin: "2024-06",
    description:
      "Capitaine de l'équipe de football de l'école lors du tournoi inter-écoles régional. Organisation des entraînements et coordination avec l'administration.",
  },
  {
    id: 2,
    titre: "Membre du club IEEE",
    organisation: "IEEE Student Branch ENSA",
    categorie: "associatif",
    dateDebut: "2024-10",
    description:
      "Participation active au club IEEE : organisation de workshops techniques, présentation de projets d'innovation lors du Hackathon annuel.",
  },
]);

const newActivite = ref({
  titre: "",
  organisation: "",
  categorie: "associatif" as Activite["categorie"],
  dateDebut: "",
  dateFin: "",
  description: "",
});

function ajouterActivite() {
  if (!newActivite.value.titre || !newActivite.value.organisation) return;
  activites.value.push({
    id: Date.now(),
    titre: newActivite.value.titre,
    organisation: newActivite.value.organisation,
    categorie: newActivite.value.categorie,
    dateDebut: newActivite.value.dateDebut,
    dateFin: newActivite.value.dateFin || undefined,
    description: newActivite.value.description,
  });
  newActivite.value = {
    titre: "",
    organisation: "",
    categorie: "associatif",
    dateDebut: "",
    dateFin: "",
    description: "",
  };
  showForm.value = false;
}

function supprimerActivite(id: number) {
  activites.value = activites.value.filter((a) => a.id !== id);
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <h1 class="panel-title">Activités parascolaires</h1>
              <p class="panel-subtitle">{{ activites.length }} activité{{ activites.length > 1 ? 's' : '' }} enregistrée{{ activites.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
          <button class="btn-add" @click="showForm = !showForm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter une activité
          </button>
        </div>

        <!-- Formulaire d'ajout -->
        <div v-if="showForm" class="form-card">
          <h2 class="form-title">Nouvelle activité</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Titre *</label>
              <input v-model="newActivite.titre" placeholder="Ex: Capitaine équipe de football" />
            </div>
            <div class="form-group">
              <label>Organisation *</label>
              <input v-model="newActivite.organisation" placeholder="Ex: ENSA Tanger, IEEE..." />
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select v-model="newActivite.categorie">
                <option value="sport">Sport</option>
                <option value="culturel">Culturel</option>
                <option value="associatif">Associatif</option>
                <option value="benevolat">Bénévolat</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div class="form-group"></div>
            <div class="form-group">
              <label>Date de début</label>
              <input type="month" v-model="newActivite.dateDebut" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input type="month" v-model="newActivite.dateFin" />
            </div>
          </div>
          <div class="form-group full">
            <label>Description</label>
            <textarea v-model="newActivite.description" placeholder="Décrivez votre rôle et vos réalisations..." rows="3" />
          </div>
          <div class="form-actions">
            <button class="btn-cancel" @click="showForm = false">Annuler</button>
            <button class="btn-save" @click="ajouterActivite">Enregistrer</button>
          </div>
        </div>

        <!-- État vide -->
        <div v-if="activites.length === 0 && !showForm" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0c8d8" stroke-width="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p>Aucune activité parascolaire enregistrée.</p>
          <button class="btn-add" @click="showForm = true">Ajouter votre première activité</button>
        </div>

        <!-- Liste -->
        <div class="activites-list">
          <div v-for="activite in activites" :key="activite.id" class="activite-card">
            <div class="card-left">
              <div class="cat-icon" :style="{ background: categorieColors[activite.categorie] + '22', color: categorieColors[activite.categorie] }">
                <svg v-if="activite.categorie === 'sport'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M9.17 14.83l-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>
                <svg v-else-if="activite.categorie === 'culturel'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                <svg v-else-if="activite.categorie === 'associatif'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <svg v-else-if="activite.categorie === 'benevolat'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
            </div>
            <div class="card-body">
              <div class="card-header-row">
                <div>
                  <h3 class="card-title">{{ activite.titre }}</h3>
                  <p class="card-org">{{ activite.organisation }}</p>
                </div>
                <div class="card-right-actions">
                  <span class="cat-badge" :style="{ background: categorieColors[activite.categorie] + '18', color: categorieColors[activite.categorie] }">
                    {{ categorieLabels[activite.categorie] }}
                  </span>
                  <button class="btn-delete" @click="supprimerActivite(activite.id)" title="Supprimer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="card-meta" v-if="activite.dateDebut">
                <span class="meta-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatDate(activite.dateDebut) }} – {{ activite.dateFin ? formatDate(activite.dateFin) : 'En cours' }}
                </span>
              </div>
              <p v-if="activite.description" class="card-desc">{{ activite.description }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page { height: 100vh; width: 100vw; overflow: hidden; background: var(--input-bg); padding-top: 50px; font-family: var(--font-body); }
.shell { height: calc(100vh - 50px); padding: 20px; overflow-y: auto; transition: var(--ease); }
.shellShift { padding-left: 238px; }
.content-panel { max-width: 820px; margin: 0 auto; background: #fff; border-radius: var(--radius-card); box-shadow: 0 4px 24px rgba(17,24,39,0.08); overflow: hidden; }

.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 28px; border-bottom: 1px solid var(--input-bg); }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon { width: 44px; height: 44px; background: rgba(79,70,229,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--purple); }
.panel-title { font-size: 1.25rem; font-weight: 700; color: var(--text-dark); margin: 0; font-family: var(--font-head); }
.panel-subtitle { font-size: 0.78rem; color: var(--text-gray); margin: 2px 0 0; }

.btn-add { display: flex; align-items: center; gap: 6px; background: var(--purple); color: #fff; border: none; border-radius: var(--radius-pill); padding: 9px 18px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: var(--ease); font-family: var(--font-head); }
.btn-add:hover { background: var(--navy-mid); }

.form-card { margin: 20px 28px; padding: 22px; background: rgba(79,70,229,0.04); border: 1px solid rgba(79,70,229,0.15); border-radius: var(--radius-card); }
.form-title { font-size: 1rem; font-weight: 700; color: var(--text-dark); margin: 0 0 16px; font-family: var(--font-head); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { margin: 12px 0 0; }
.form-group label { font-size: 0.78rem; font-weight: 600; color: var(--text-gray); font-family: var(--font-head); }
.form-group input,
.form-group select,
.form-group textarea { border: 1px solid var(--input-bg); border-radius: 8px; padding: 9px 12px; font-size: 0.85rem; color: var(--text-dark); background: #fff; outline: none; resize: vertical; font-family: var(--font-body); transition: var(--ease); }
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.btn-cancel { padding: 8px 16px; border-radius: var(--radius-pill); border: 1px solid var(--input-bg); background: #fff; color: var(--text-gray); font-size: 0.85rem; cursor: pointer; font-family: var(--font-head); transition: var(--ease); }
.btn-cancel:hover { background: var(--input-bg); }
.btn-save { padding: 8px 20px; border-radius: var(--radius-pill); border: none; background: var(--purple); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: var(--font-head); transition: var(--ease); }
.btn-save:hover { background: var(--navy-mid); }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-gray); font-size: 0.9rem; }

.activites-list { padding: 16px 28px 28px; display: flex; flex-direction: column; gap: 14px; }
.activite-card { display: flex; gap: 16px; padding: 18px; border: 1px solid var(--input-bg); border-radius: var(--radius-card); transition: var(--ease); }
.activite-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.12); border-color: rgba(79,70,229,0.2); }

.cat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-body { flex: 1; min-width: 0; }
.card-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
.card-title { font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin: 0; font-family: var(--font-head); }
.card-org { font-size: 0.82rem; color: var(--purple); font-weight: 600; margin: 2px 0 0; }
.card-right-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.cat-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-pill); font-family: var(--font-head); }
.btn-delete { background: none; border: none; cursor: pointer; color: var(--input-bg); padding: 4px; border-radius: 6px; transition: var(--ease); }
.btn-delete:hover { color: var(--error); background: rgba(223,30,33,0.08); }
.card-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.meta-chip { display: inline-flex; align-items: center; gap: 4px; background: var(--input-bg); color: var(--text-gray); font-size: 0.75rem; padding: 3px 10px; border-radius: var(--radius-pill); font-family: var(--font-body); }
.card-desc { font-size: 0.83rem; color: var(--text-gray); line-height: 1.6; margin: 6px 0 0; font-family: var(--font-body); }
</style>
