<script setup lang="ts">
defineProps<{
  badges?: string[];
  compact?: boolean;
}>();

const badgeKey = (badge: string) =>
  badge
    .replace(/[^\p{L}\p{N}/\s-]/gu, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const badgeMeanings: Record<string, string> = {
  devops: "L'étudiant a réalisé des projets avec Docker et CI/CD",
  "web-developer": "Plusieurs projets web validés",
  "ai-data": "Projets en IA ou data",
  "security-aware": "Projets avec bonnes pratiques de sécurité",
  "hackathon-participant": "Participation à des hackathons",
};

const badgeMeaning = (badge: string) => badgeMeanings[badgeKey(badge)] ?? badge;
</script>

<template>
  <div v-if="badges?.length" class="skill-badges" :class="{ compact }">
    <span
      v-for="badge in badges.slice(0, 3)"
      :key="badge"
      class="skill-badge"
      :class="`skill-badge-${badgeKey(badge)}`"
      :title="badgeMeaning(badge)"
    >
      {{ badge }}
    </span>
  </div>
</template>

<style scoped>
.skill-badges {
  margin-top: 7px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.skill-badges.compact {
  margin-top: 5px;
}

.skill-badge {
  padding: 3px 8px;
  border: 1px solid rgba(79, 70, 229, 0.14);
  border-radius: var(--radius-pill);
  background: rgba(79, 70, 229, 0.08);
  color: var(--purple);
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.skill-badge-cloud,
.skill-badge-web-developer {
  border-color: rgba(6, 182, 212, 0.2);
  background: rgba(6, 182, 212, 0.1);
  color: var(--blue-w);
}

.skill-badge-ia,
.skill-badge-data-science,
.skill-badge-ai-data {
  border-color: rgba(90, 137, 237, 0.18);
  background: rgba(90, 137, 237, 0.1);
  color: var(--purple-light);
}

.skill-badge-cybersecurite,
.skill-badge-security-aware {
  border-color: rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: var(--error);
}

.skill-badge-hackathon-participant {
  border-color: rgba(79, 70, 229, 0.16);
  background: var(--overlay-purple-10);
  color: var(--purple);
}
</style>
