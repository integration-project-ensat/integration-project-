<template>
  <div class="page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <Sidebar :isOpen="sidebarOpen" />

    <div class="shell" :class="{ shellShift: sidebarOpen }">
      <div class="content-panel">
        <div class="panel-header">
          <div>
            <h1 class="panel-title">Mes recos</h1>
            <p class="panel-subtitle">Toutes les recommandations reçues sur votre profil.</p>
          </div>
          <div class="stats-row">
            <span class="stat-chip">Total {{ recommendations.length }}</span>
            <span class="stat-chip success">Validées {{ validatedCount }}</span>
            <span class="stat-chip pending">En attente {{ pendingCount }}</span>
            <span class="stat-chip refused">Refusées {{ refusedCount }}</span>
          </div>
        </div>

        <div class="tabs-row">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="tab-btn"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div v-if="filteredRecommendations.length === 0" class="empty-state">
          <p>Aucune recommandation dans cette catégorie.</p>
        </div>

        <div v-else class="cards">
          <article v-for="recommendation in filteredRecommendations" :key="recommendation.id" class="card">
            <div class="avatar">
              <img v-if="recommendation.avatar" :src="recommendation.avatar" alt="" />
              <span v-else>{{ getInitials(recommendation.author) }}</span>
            </div>

            <div class="card-body">
              <div class="card-head">
                <div>
                  <h3>{{ recommendation.author }}</h3>
                  <p>{{ recommendation.roleLabel }}</p>
                </div>
                <span class="status" :class="statusClass(recommendation.status)">
                  {{ recommendation.statusLabel }}
                </span>
              </div>

              <p class="message">{{ recommendation.message || 'Recommandation sans commentaire.' }}</p>

              <div class="card-footer">
                <span>{{ recommendation.dateLabel }}</span>
                <button
                  v-if="recommendation.status === 'VALIDE' && portfolioId"
                  class="portfolio-btn"
                  @click="addRecommendationToPortfolio(recommendation)"
                >
                  Ajouter au portfolio
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { profileService } from "../services/profile.service";
import { recommendationService } from "../services/recommendation.service";

type RecommendationStatus = "EN_ATTENTE" | "VALIDE" | "REFUSE";

interface RecommendationItem {
  id: number;
  author: string;
  avatar: string;
  roleLabel: string;
  message: string;
  status: RecommendationStatus;
  statusLabel: string;
  dateLabel: string;
}

const sidebarOpen = ref(true);
const activeTab = ref<"Toutes" | "Validées" | "En attente" | "Refusées">("Toutes");
const recommendations = ref<RecommendationItem[]>([]);
const portfolioId = ref<number | null>(null);
const currentUserId = ref<number | null>(null);
const tabs = ["Toutes", "Validées", "En attente", "Refusées"] as const;

const validatedCount = computed(() => recommendations.value.filter((item) => item.status === "VALIDE").length);
const pendingCount = computed(() => recommendations.value.filter((item) => item.status === "EN_ATTENTE").length);
const refusedCount = computed(() => recommendations.value.filter((item) => item.status === "REFUSE").length);

const filteredRecommendations = computed(() => {
  if (activeTab.value === "Validées") return recommendations.value.filter((item) => item.status === "VALIDE");
  if (activeTab.value === "En attente") return recommendations.value.filter((item) => item.status === "EN_ATTENTE");
  if (activeTab.value === "Refusées") return recommendations.value.filter((item) => item.status === "REFUSE");
  return recommendations.value;
});

function readCurrentUserId() {
  try {
    const rawUser = localStorage.getItem("user");
    const parsed = rawUser ? JSON.parse(rawUser) : null;
    currentUserId.value = Number(parsed?.id ?? parsed?.id_utilisateur ?? 0) || null;
  } catch {
    currentUserId.value = null;
  }
}

function formatRole(role: string) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "PROFESSIONNEL") return "Professionnel";
  if (normalized === "ETUDIANT") return "Étudiant";
  return "Professeur";
}

function formatStatus(status: string): RecommendationStatus {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "VALIDE") return "VALIDE";
  if (normalized === "REFUSE") return "REFUSE";
  return "EN_ATTENTE";
}

function statusLabel(status: RecommendationStatus) {
  if (status === "VALIDE") return "Validée";
  if (status === "REFUSE") return "Refusée";
  return "En attente";
}

function formatDate(value: any) {
  if (!value) return "Date indisponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date indisponible";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function mapRecommendation(item: any): RecommendationItem {
  const status = formatStatus(item?.statut);
  const author = [item?.auteur?.prenom, item?.auteur?.nom].filter(Boolean).join(" ") || "Auteur inconnu";

  return {
    id: Number(item?.id_recommandation),
    author,
    avatar: item?.auteur?.profil?.photo_profil || "",
    roleLabel: formatRole(item?.role_auteur ?? item?.auteur?.role),
    message: item?.message || "",
    status,
    statusLabel: statusLabel(status),
    dateLabel: formatDate(item?.date_recommandation ?? item?.createdAt ?? item?.id_recommandation),
  };
}

async function loadProfileMeta() {
  const profile = await profileService.getProfile();
  portfolioId.value = profile?.portfolioId ?? null;
}

async function loadRecommendations() {
  if (!currentUserId.value) {
    recommendations.value = [];
    return;
  }

  try {
    const { data } = await recommendationService.getRecommendations({ id_etudiant_cible: currentUserId.value });
    recommendations.value = Array.isArray(data?.data) ? data.data.map(mapRecommendation) : [];
  } catch (error) {
    console.warn("Chargement des recommandations impossible", error);
    recommendations.value = [];
  }
}

async function addRecommendationToPortfolio(item: RecommendationItem) {
  if (!portfolioId.value) return;

  try {
    await recommendationService.addToPortfolio(item.id, {
      id_portfolio: portfolioId.value,
      est_affichee: true,
    });
  } catch (error) {
    console.warn("Ajout au portfolio impossible", error);
  }
}

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function statusClass(status: RecommendationStatus) {
  return {
    success: status === "VALIDE",
    pending: status === "EN_ATTENTE",
    refused: status === "REFUSE",
  };
}

onMounted(async () => {
  readCurrentUserId();
  await loadProfileMeta();
  await loadRecommendations();
});
</script>

<style scoped>
.page { height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-soft-purple); padding-top: 50px; font-family: var(--font-body); }
.shell { height: calc(100vh - 50px); padding: 14px; overflow-y: auto; transition: var(--ease); }
.shellShift { padding-left: 234px; padding-right: 14px; }
.content-panel { width: 100%; background: var(--white); border-radius: var(--radius-card); box-shadow: 0 4px 24px var(--overlay-navy-08); overflow: hidden; border: 1px solid rgba(17,24,39,0.04); }
.panel-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:22px 28px; border-bottom:1px solid var(--input-bg); }
.panel-title { font-size:1.25rem; font-weight:700; color:var(--text-dark); margin:0; font-family:var(--font-head); }
.panel-subtitle { font-size:.82rem; color:var(--text-gray); margin:4px 0 0; }
.stats-row { display:flex; gap:8px; flex-wrap:wrap; }
.stat-chip,.status { border-radius:999px; padding:6px 12px; font-size:.76rem; font-weight:700; }
.stat-chip { background:var(--input-bg); color:var(--text-gray); }
.stat-chip.success,.status.success { background:rgba(16,185,129,.12); color:var(--success-strong); }
.stat-chip.pending,.status.pending { background:rgba(245,158,11,.12); color:#d97706; }
.stat-chip.refused,.status.refused { background:rgba(239,68,68,.12); color:var(--danger); }
.tabs-row { display:flex; gap:8px; padding:14px 28px; border-bottom:1px solid var(--input-bg); }
.tab-btn { border:none; background:var(--white); color:var(--text-gray); border-radius:999px; padding:8px 14px; font-weight:600; cursor:pointer; transition: var(--ease); }
.tab-btn.active { background:rgba(79,70,229,.1); color:var(--purple); }
.cards { padding:18px 28px 28px; display:flex; flex-direction:column; gap:14px; }
.card { display:flex; gap:16px; border:1px solid var(--input-bg); border-radius:var(--radius-card); padding:18px; background: linear-gradient(180deg, var(--white) 0%, #fbfbff 100%); }
.avatar { width:48px; height:48px; border-radius:50%; background:var(--indigo-soft); color:var(--purple); display:flex; align-items:center; justify-content:center; font-weight:700; overflow:hidden; flex-shrink:0; }
.avatar img { width:100%; height:100%; object-fit:cover; }
.card-body { flex:1; min-width:0; }
.card-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
.card-head h3 { margin:0; font-size:.98rem; font-family:var(--font-head); }
.card-head p { margin:4px 0 0; font-size:.8rem; color:var(--text-gray); }
.message { margin:10px 0 12px; color:var(--text-dark); line-height:1.6; }
.card-footer { display:flex; justify-content:space-between; gap:12px; align-items:center; color:var(--text-gray); font-size:.8rem; }
.portfolio-btn { border:none; background:var(--purple); color:var(--white); border-radius:999px; padding:8px 14px; font-weight:700; cursor:pointer; transition: var(--ease); }
.portfolio-btn:hover { background: var(--purple-hover); }
.empty-state { padding:50px 28px; color:var(--text-gray); text-align:center; }
</style>
