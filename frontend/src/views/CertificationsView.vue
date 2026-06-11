<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { attestationService } from "../services/attestation.service";
import { diplomeService } from "../services/diplome.service";

interface Certification {
  id: number;
  source: "diplome" | "attestation";
  titre: string;
  organisme: string;
  type: "diplome" | "certification" | "formation";
  dateObtention: string;
  dateExpiration?: string;
  lienVerification?: string;
  description: string;
}

const sidebarOpen = ref(true);
const route = useRoute();
const activeTab = ref<"tous" | "diplome" | "certification" | "formation">("tous");
const certifications = ref<Certification[]>([]);
const highlightedCertificationId = ref<number | null>(null);

const typeLabels: Record<Certification["type"], string> = {
  diplome: "Dipl�me",
  certification: "Certification",
  formation: "Formation",
};

const typeColors: Record<Certification["type"], string> = {
  diplome: "#0ea5e9",
  certification: "#6c5ce7",
  formation: "#10b981",
};

function mapDiplome(item: any): Certification {
  return {
    id: Number(item?.id_diplome),
    source: "diplome",
    titre: item?.titre_diplome || "Dipl�me",
    organisme: item?.etablissement || "�tablissement non renseign�",
    type: "diplome",
    dateObtention: item?.annee_fin ? `${item.annee_fin}-06` : "",
    description: item?.domaine || "",
  };
}

function mapAttestation(item: any): Certification {
  const rawType = String(item?.type || "").toLowerCase();
  const mappedType: Certification["type"] = rawType.includes("formation")
    ? "formation"
    : "certification";

  return {
    id: Number(item?.id_attestation),
    source: "attestation",
    titre: item?.titre || item?.type || "Attestation",
    organisme: item?.organisme || "Organisme non renseign�",
    type: mappedType,
    dateObtention: item?.date ? String(item.date).slice(0, 7) : "",
    dateExpiration: item?.date_retention ? String(item.date_retention).slice(0, 7) : undefined,
    lienVerification: undefined,
    description: item?.description || "",
  };
}

async function loadCertifications() {
  try {
    const [diplomesResponse, attestationsResponse] = await Promise.all([
      diplomeService.getMesDiplomes(),
      attestationService.getAttestations(),
    ]);

    const diplomes = Array.isArray(diplomesResponse?.data?.data)
      ? diplomesResponse.data.data.map(mapDiplome)
      : [];
    const attestations = Array.isArray(attestationsResponse?.data?.data)
      ? attestationsResponse.data.data.map(mapAttestation)
      : [];

    certifications.value = [...diplomes, ...attestations];
    await scrollToHighlightedCertification();
  } catch (error) {
    console.warn("Chargement des dipl�mes/certifications impossible", error);
    certifications.value = [];
  }
}

const syncHighlightedCertification = () => {
  const rawHighlight = route.query.highlight ?? route.query.id;
  const value = Array.isArray(rawHighlight) ? rawHighlight[0] : rawHighlight;
  const parsed = Number(String(value || ""));
  highlightedCertificationId.value = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

async function scrollToHighlightedCertification() {
  await nextTick();
  const id = highlightedCertificationId.value;
  if (!id) return;
  document.getElementById(`certification-${id}`)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

async function supprimerCertification(item: Certification) {
  try {
    if (item.source === "diplome") {
      await diplomeService.deleteDiplome(item.id);
    } else {
      await attestationService.deleteAttestation(item.id);
    }
    await loadCertifications();
  } catch (error) {
    console.warn("Suppression dipl�me/certification impossible", error);
  }
}

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  const mois = ["", "Jan", "F�v", "Mar", "Avr", "Mai", "Juin", "Juil", "Ao�t", "Sep", "Oct", "Nov", "D�c"];
  return `${mois[parseInt(m || "0")]} ${y}`;
}

const filtered = computed(() => {
  if (activeTab.value === "tous") return certifications.value;
  return certifications.value.filter((c) => c.type === activeTab.value);
});

onMounted(() => {
  syncHighlightedCertification();
  loadCertifications();
});

watch(
  () => route.query.highlight,
  async () => {
    syncHighlightedCertification();
    await scrollToHighlightedCertification();
  },
);
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
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div>
              <h1 class="panel-title">Diplômes & Certifications</h1>
              <p class="panel-subtitle">{{ certifications.length }} élément{{ certifications.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>

        <!-- Tabs filtres -->
        <div class="tabs-row">
          <button
            v-for="tab in (['tous', 'diplome', 'certification', 'formation'] as const)"
            :key="tab"
            class="tab-btn"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab === 'tous' ? 'Tous' : typeLabels[tab] }}
            <span class="tab-count">{{ tab === 'tous' ? certifications.length : certifications.filter(c => c.type === tab).length }}</span>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0c8d8" stroke-width="1.5">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          <p>Aucun élément dans cette catégorie.</p>
        </div>

        <!-- Liste -->
        <div class="cert-list">
          <div
            v-for="cert in filtered"
            :key="`${cert.source}-${cert.id}`"
            class="cert-card"
            :id="`certification-${cert.id}`"
            :class="{ 'is-highlighted': highlightedCertificationId === cert.id }"
          >
            <div class="cert-left" :style="{ background: typeColors[cert.type] + '18', borderColor: typeColors[cert.type] + '33' }">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="typeColors[cert.type]" stroke-width="2">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div class="cert-body">
              <div class="cert-header-row">
                <div>
                  <div class="cert-type-badge" :style="{ background: typeColors[cert.type] + '18', color: typeColors[cert.type] }">
                    {{ typeLabels[cert.type] }}
                  </div>
                  <h3 class="cert-title">{{ cert.titre }}</h3>
                  <p class="cert-org">{{ cert.organisme }}</p>
                </div>
                <button class="btn-delete" @click="supprimerCertification(cert)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
              <div class="cert-meta">
                <span v-if="cert.dateObtention" class="meta-chip">
                  Obtenu : {{ formatDate(cert.dateObtention) }}
                </span>
                <span v-if="cert.dateExpiration" class="meta-chip expire">
                  Expire : {{ formatDate(cert.dateExpiration) }}
                </span>
              </div>
              <p v-if="cert.description" class="cert-desc">{{ cert.description }}</p>
              <a v-if="cert.lienVerification" :href="cert.lienVerification" target="_blank" class="verify-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Vérifier le certificat
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page { height: 100vh; width: 100vw; overflow: hidden; background: var(--input-bg); padding-top: 50px; font-family: var(--font-body); }
.shell { height: calc(100vh - 50px); padding: 14px; overflow-y: auto; transition: var(--ease); }
.shellShift { padding-left: 234px; padding-right: 14px; }
.content-panel { width: 100%; max-width: none; margin: 0; background: #fff; border-radius: var(--radius-card); box-shadow: 0 4px 24px rgba(17,24,39,0.08); overflow: hidden; }

.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 28px; border-bottom: 1px solid var(--input-bg); }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon { width: 44px; height: 44px; background: rgba(79,70,229,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--purple); }
.panel-title { font-size: 1.25rem; font-weight: 700; color: var(--text-dark); margin: 0; font-family: var(--font-head); }
.panel-subtitle { font-size: 0.78rem; color: var(--text-gray); margin: 2px 0 0; }

.btn-add { display: flex; align-items: center; gap: 6px; background: var(--purple); color: #fff; border: none; border-radius: var(--radius-pill); padding: 9px 18px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: var(--ease); font-family: var(--font-head); }
.btn-add:hover { background: var(--navy-mid); }

.tabs-row { display: flex; gap: 4px; padding: 14px 28px; border-bottom: 1px solid var(--input-bg); }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: var(--radius-pill); border: none; background: none; font-size: 0.83rem; color: var(--text-gray); cursor: pointer; transition: var(--ease); font-family: var(--font-body); }
.tab-btn:hover { background: rgba(79,70,229,0.06); color: var(--purple); }
.tab-btn.active { background: rgba(79,70,229,0.1); color: var(--purple); font-weight: 700; font-family: var(--font-head); }
.tab-count { background: var(--input-bg); color: var(--text-gray); border-radius: var(--radius-pill); padding: 1px 7px; font-size: 0.72rem; font-weight: 700; }
.tab-btn.active .tab-count { background: var(--purple); color: #fff; }

.form-card { margin: 20px 28px; padding: 22px; background: rgba(79,70,229,0.04); border: 1px solid rgba(79,70,229,0.15); border-radius: var(--radius-card); }
.form-title { font-size: 1rem; font-weight: 700; color: var(--text-dark); margin: 0 0 16px; font-family: var(--font-head); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { margin: 12px 0 0; }
.form-group label { font-size: 0.78rem; font-weight: 600; color: var(--text-gray); font-family: var(--font-head); }
.form-group input, .form-group select, .form-group textarea { border: 1px solid var(--input-bg); border-radius: 8px; padding: 9px 12px; font-size: 0.85rem; color: var(--text-dark); background: #fff; outline: none; resize: vertical; font-family: var(--font-body); transition: var(--ease); }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.btn-cancel { padding: 8px 16px; border-radius: var(--radius-pill); border: 1px solid var(--input-bg); background: #fff; color: var(--text-gray); font-size: 0.85rem; cursor: pointer; font-family: var(--font-head); transition: var(--ease); }
.btn-cancel:hover { background: var(--input-bg); }
.btn-save { padding: 8px 20px; border-radius: var(--radius-pill); border: none; background: var(--purple); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: var(--font-head); transition: var(--ease); }
.btn-save:hover { background: var(--navy-mid); }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-gray); font-size: 0.9rem; }

.cert-list { padding: 16px 28px 28px; display: flex; flex-direction: column; gap: 14px; }
.cert-card { display: flex; gap: 16px; padding: 18px; border: 1px solid var(--input-bg); border-radius: var(--radius-card); transition: var(--ease); }
.cert-card.is-highlighted { box-shadow: 0 10px 24px rgba(79, 70, 229, 0.14); border-color: var(--purple); }
.cert-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.12); border-color: rgba(79,70,229,0.2); }
.cert-left { width: 48px; height: 48px; border-radius: 12px; border: 1px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cert-body { flex: 1; min-width: 0; }
.cert-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
.cert-type-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 2px 10px; border-radius: var(--radius-pill); margin-bottom: 4px; font-family: var(--font-head); }
.cert-title { font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin: 0; font-family: var(--font-head); }
.cert-org { font-size: 0.82rem; color: var(--text-gray); margin: 2px 0 0; }
.btn-delete { background: none; border: none; cursor: pointer; color: var(--input-bg); padding: 4px; border-radius: 6px; transition: var(--ease); }
.btn-delete:hover { color: var(--error); background: rgba(223,30,33,0.08); }
.cert-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.meta-chip { display: inline-flex; align-items: center; gap: 4px; background: var(--input-bg); color: var(--text-gray); font-size: 0.75rem; padding: 3px 10px; border-radius: var(--radius-pill); font-family: var(--font-body); }
.meta-chip.expire { background: rgba(234,88,12,0.1); color: #ea580c; }
.cert-desc { font-size: 0.83rem; color: var(--text-gray); line-height: 1.6; margin: 6px 0 10px; font-family: var(--font-body); }
.verify-link { display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; color: var(--purple); font-weight: 600; text-decoration: none; font-family: var(--font-head); transition: var(--ease); }
.verify-link:hover { color: var(--navy-mid); text-decoration: underline; }
</style>

