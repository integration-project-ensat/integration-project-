<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { useProfValidationRequests } from "../store/profValidationRequests";

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(true);
const { findStudentRequests } = useProfValidationRequests();

const studentId = computed(() => String(route.params.id ?? ""));
const studentRequests = computed(() => findStudentRequests(studentId.value));
const student = computed(() => studentRequests.value[0]);

const profileBadges = computed(() => {
  const title = studentRequests.value.map((request) => request.title).join(" ").toLowerCase();
  if (title.includes("devops")) return ["🌊 DevOps", "🔐 Security Aware"];
  if (title.includes("cloud")) return ["🧠 AI / Data", "🌐 Web Developer"];
  if (title.includes("mobile")) return ["🌐 Web Developer", "🏆 Hackathon Participant"];
  return ["🌐 Web Developer"];
});
</script>

<template>
  <div class="profile-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarProf :isOpen="sidebarOpen" />

    <main class="profile-shell" :class="{ 'profile-shellShift': sidebarOpen }">
      <section v-if="student" class="profile-card">
        <button type="button" class="back-btn" @click="router.back()">
          ← Retour
        </button>

        <div class="profile-hero">
          <div class="student-avatar">{{ student.initials }}</div>
          <div>
            <p class="profile-kicker">Profil étudiant</p>
            <h1>{{ student.studentName }}</h1>
            <SkillBadges :badges="profileBadges" compact />
            <p>Demandes liées aux validations professeur.</p>
          </div>
        </div>

        <div class="request-list">
          <article
            v-for="request in studentRequests"
            :key="request.id"
            class="request-card"
          >
            <span>{{ request.type }}</span>
            <h2>{{ request.title }}</h2>
            <p>{{ request.description }}</p>
            <strong>{{ request.status }}</strong>
          </article>
        </div>
      </section>

      <section v-else class="profile-card">
        <button type="button" class="back-btn" @click="router.back()">
          ← Retour
        </button>
        <h1>Profil étudiant</h1>
        <p>Aucune donnée mock trouvée pour cet étudiant.</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.profile-shell {
  padding: 20px;
  transition: padding-left 0.3s ease;
}

.profile-shellShift {
  padding-left: 236px;
}

.profile-card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: var(--radius-card);
  background: white;
  padding: 26px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.09);
}

.back-btn {
  border-radius: var(--radius-pill);
  background: #eeecff;
  color: var(--purple);
  padding: 9px 14px;
  font-weight: 800;
  margin-bottom: 22px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.student-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 800;
}

.profile-kicker {
  color: var(--text-gray);
  font-weight: 800;
}

h1 {
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 34px;
  font-weight: 800;
}

.profile-hero p,
.profile-card > p {
  color: #475569;
  font-weight: 700;
}

.request-list {
  display: grid;
  gap: 12px;
}

.request-card {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  padding: 16px;
}

.request-card span {
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 800;
}

.request-card h2 {
  color: var(--purple);
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 800;
  margin: 6px 0;
}

.request-card p {
  color: #475569;
  font-weight: 700;
  margin-bottom: 8px;
}

.request-card strong {
  color: var(--text-dark);
  font-weight: 800;
}

@media (max-width: 760px) {
  .profile-shell,
  .profile-shellShift {
    padding: 16px;
  }

  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
