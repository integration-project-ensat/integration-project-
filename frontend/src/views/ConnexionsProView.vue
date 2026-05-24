<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import SidebarStudent from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import {
  type ProConnectionStatus,
  useProConnections,
} from "../store/proConnections";

const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(true);
const activeTab = ref<"pending" | "accepted">("pending");
const { pendingRequests, acceptedRequests, refusedRequests, updateRequest } =
  useProConnections();

const tabs = [
  { key: "pending", label: "En attente" },
  { key: "accepted", label: "Mes connexions" },
] as const;

const currentRole = computed(() => {
  if (route.path.startsWith("/prof")) return "prof";
  if (route.path.startsWith("/student")) return "student";
  return "pro";
});

const visibleRequests = computed(() => {
  if (activeTab.value === "accepted") return acceptedRequests.value;
  return pendingRequests.value;
});

const setStatus = (id: string, status: ProConnectionStatus) => {
  updateRequest(id, status);
};
</script>

<template>
  <div class="connexions-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarStudent v-if="currentRole === 'student'" :isOpen="sidebarOpen" />
    <SidebarProf v-else-if="currentRole === 'prof'" :isOpen="sidebarOpen" />
    <SidebarPro v-else :isOpen="sidebarOpen" />

    <main class="connexions-shell" :class="{ shifted: sidebarOpen }">
      <section class="connexions-panel">
        <div class="page-heading">
          <p>Espace professionnel</p>
          <h1>Connexions</h1>
          <span>Gérez les demandes de connexion des étudiants.</span>
        </div>

        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="requests-grid">
          <article
            v-for="request in visibleRequests"
            :key="request.id"
            class="request-card"
          >
            <button
              type="button"
              class="avatar"
              @click="router.push(request.profilePath)"
            >
              {{ request.initials }}
            </button>
            <div class="request-body">
              <button
                type="button"
                class="name-button"
                @click="router.push(request.profilePath)"
              >
                {{ request.name }}
              </button>
              <p>{{ request.school }} · {{ request.field }}</p>
              <span>{{ request.message }}</span>
              <small>{{ request.time }}</small>

              <div class="request-actions">
                <button
                  v-if="request.status !== 'accepted'"
                  type="button"
                  @click="setStatus(request.id, 'accepted')"
                >
                  Accepter
                </button>
                <button
                  v-if="request.status !== 'refused'"
                  type="button"
                  class="soft-danger"
                  @click="setStatus(request.id, 'refused')"
                >
                  Refuser
                </button>
                <button type="button" @click="router.push(request.profilePath)">
                  Voir profil
                </button>
              </div>
            </div>
          </article>

          <p v-if="!visibleRequests.length" class="empty-state">
            Aucune connexion dans cette catégorie.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.connexions-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.connexions-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 14px;
  transition: padding-left 0.3s ease;
}

.connexions-shell.shifted {
  padding-left: 234px;
}

.connexions-panel,
.page-heading,
.request-card {
  background: white;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.08);
}

.connexions-panel {
  overflow: hidden;
}

.page-heading {
  box-shadow: none;
  border-radius: 0;
  border-width: 0 0 1px;
  padding: 24px;
}

.page-heading p,
.page-heading span,
.request-body p,
.request-body small {
  color: var(--text-gray);
  font-weight: 800;
}

.page-heading h1 {
  color: var(--text-dark);
  font-size: 34px;
  font-weight: 900;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--input-bg);
}

.tabs button,
.request-actions button {
  border-radius: 100px 180px 0px 100px;
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: white;
  color: var(--navy-mid);
  padding: 8px 14px;
  font-weight: 900;
}

.tabs button.active,
.request-actions button:first-child {
  background: var(--purple);
  border-color: var(--purple);
  color: white;
}

.requests-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 14px;
  padding: 18px;
}

.request-card {
  display: flex;
  gap: 14px;
  padding: 16px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  font-weight: 900;
  flex-shrink: 0;
}

.request-body {
  display: grid;
  gap: 6px;
}

.name-button {
  justify-self: start;
  background: transparent;
  color: var(--text-dark);
  font-weight: 900;
  padding: 0;
}

.request-body span {
  color: var(--navy-mid);
  font-weight: 800;
}

.request-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.request-actions .soft-danger {
  background: rgba(223, 30, 33, 0.08);
  border-color: rgba(223, 30, 33, 0.2);
  color: var(--error);
}

.empty-state {
  color: var(--text-gray);
  font-weight: 800;
  padding: 16px;
}

@media (max-width: 900px) {
  .requests-grid {
    grid-template-columns: 1fr;
  }
}
</style>
