<template>
  <div class="page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <Sidebar :isOpen="sidebarOpen" />

    <div class="shell" :class="{ shellShift: sidebarOpen }">
      <div class="content-panel">
        <div class="panel-header">
          <div>
            <h1 class="panel-title">Commentaires</h1>
            <p class="panel-subtitle">Commentaires reçus sur vos posts et votre portfolio.</p>
          </div>
          <div class="stats-row">
            <span class="stat-chip">Total {{ comments.length }}</span>
            <span class="stat-chip success">Validés {{ validatedCount }}</span>
            <span class="stat-chip pending">En attente {{ pendingCount }}</span>
            <span class="stat-chip refused">Refusés {{ refusedCount }}</span>
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

        <div v-if="filteredComments.length === 0" class="empty-state">
          <p>Aucun commentaire trouvé pour le moment.</p>
        </div>

        <div v-else class="cards">
          <article v-for="comment in filteredComments" :key="comment.key" class="card">
            <div class="avatar">
              <span>{{ getInitials(comment.author) }}</span>
            </div>
            <div class="card-body">
              <div class="card-head">
                <div>
                  <h3>{{ comment.author }}</h3>
                  <p>{{ comment.context }}</p>
                </div>
                <span class="status" :class="comment.statusClass">{{ comment.statusLabel }}</span>
              </div>
              <p class="message">{{ comment.content }}</p>
              <div class="card-footer">
                <span>{{ comment.dateLabel }}</span>
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
import { commentaireService } from "../services/commentaire.service";
import { postService } from "../services/post.service";
import { profileService } from "../services/profile.service";

interface StudentCommentItem {
  key: string;
  author: string;
  content: string;
  context: string;
  dateLabel: string;
  dateValue: number;
  status: "VALIDE" | "EN_ATTENTE" | "REFUSE";
  statusLabel: string;
  statusClass: "pending" | "success" | "refused";
}

const sidebarOpen = ref(true);
const comments = ref<StudentCommentItem[]>([]);
const currentUserId = ref<number | null>(null);
const activeTab = ref<"Tous" | "Validés" | "En attente" | "Refusés">("Tous");
const tabs = ["Tous", "Validés", "En attente", "Refusés"] as const;

const validatedCount = computed(() => comments.value.filter((item) => item.status === "VALIDE").length);
const pendingCount = computed(() => comments.value.filter((item) => item.status === "EN_ATTENTE").length);
const refusedCount = computed(() => comments.value.filter((item) => item.status === "REFUSE").length);

const filteredComments = computed(() => {
  if (activeTab.value === "Validés") return comments.value.filter((item) => item.status === "VALIDE");
  if (activeTab.value === "En attente") return comments.value.filter((item) => item.status === "EN_ATTENTE");
  if (activeTab.value === "Refusés") return comments.value.filter((item) => item.status === "REFUSE");
  return comments.value;
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

function formatDate(value: any) {
  if (!value) return "Date indisponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date indisponible";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function normalizeStatus(status: string) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "VALIDE") return { value: "VALIDE" as const, label: "Validé", className: "success" as const };
  if (normalized === "REFUSE") return { value: "REFUSE" as const, label: "Refusé", className: "refused" as const };
  return { value: "EN_ATTENTE" as const, label: "En attente", className: "pending" as const };
}

function mapComment(item: any, context: string, prefix: string): StudentCommentItem {
  const author = [item?.auteur?.prenom, item?.auteur?.nom].filter(Boolean).join(" ") || "Utilisateur";
  const status = normalizeStatus(item?.statut);
  const rawDate = item?.date ? new Date(item.date).getTime() : 0;

  return {
    key: `${prefix}-${item?.id_commentaire ?? Math.random()}`,
    author,
    content: item?.contenu || "Commentaire vide",
    context,
    dateLabel: formatDate(item?.date),
    dateValue: Number.isFinite(rawDate) ? rawDate : 0,
    status: status.value,
    statusLabel: status.label,
    statusClass: status.className,
  };
}

async function loadComments() {
  const merged: StudentCommentItem[] = [];

  try {
    if (currentUserId.value) {
      const { data } = await postService.getPosts();
      const posts = Array.isArray(data?.data) ? data.data : [];
      const myPosts = posts.filter(
        (post: any) => Number(post?.auteur?.id_utilisateur ?? post?.id_auteur ?? 0) === Number(currentUserId.value),
      );

      for (const post of myPosts) {
        const context = post?.contenu
          ? `Post : ${String(post.contenu).slice(0, 60)}${String(post.contenu).length > 60 ? "..." : ""}`
          : "Commentaire sur un post";
        const response = await commentaireService.getCommentaires({ id_poste: post?.id_poste });
        const postComments = Array.isArray(response?.data?.data) ? response.data.data : [];
        postComments.forEach((comment: any) => {
          merged.push(mapComment(comment, context, `post-${post?.id_poste}`));
        });
      }
    }

    const profile = await profileService.getProfile();
    if (profile?.portfolioId) {
      const { data } = await commentaireService.getCommentaires({ id_portfolio: profile.portfolioId });
      const portfolioComments = Array.isArray(data?.data) ? data.data : [];
      portfolioComments.forEach((comment: any) => {
        merged.push(mapComment(comment, "Commentaire sur votre portfolio", "portfolio"));
      });
    }

    comments.value = merged.sort((a, b) => b.dateValue - a.dateValue);
  } catch (error) {
    console.warn("Chargement des commentaires impossible", error);
    comments.value = merged.sort((a, b) => b.dateValue - a.dateValue);
  }
}

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

onMounted(async () => {
  readCurrentUserId();
  await loadComments();
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
.avatar { width:48px; height:48px; border-radius:50%; background:var(--purple-soft); color:var(--purple); display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; }
.card-body { flex:1; min-width:0; }
.card-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
.card-head h3 { margin:0; font-size:.98rem; font-family:var(--font-head); }
.card-head p { margin:4px 0 0; font-size:.8rem; color:var(--text-gray); }
.message { margin:10px 0 12px; color:var(--text-dark); line-height:1.6; }
.card-footer { color:var(--text-gray); font-size:.8rem; }
.empty-state { padding:50px 28px; color:var(--text-gray); text-align:center; }
</style>
