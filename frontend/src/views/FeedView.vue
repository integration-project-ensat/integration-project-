<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Bookmark } from "../lib/icons";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import ExploreHeader from "../components/exploreStudent/ExploreHeader.vue";
import SidebarStudent from "../components/exploreStudent/Sidebar.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { useProSavedProfiles } from "../store/proSavedProfiles";

type FeedRole = "student" | "prof" | "pro";
type FeedFilter = "Tous" | "Projets" | "Reposts" | "Populaires" | "Récents";

interface FeedComment {
  id: number;
  authorId: string;
  authorName: string;
  initials: string;
  text: string;
  time: string;
  likeCount: number;
  replies: FeedComment[];
}

interface FeedPost {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  school: string;
  time: string;
  projectTitle: string;
  description: string;
  badges: string[];
  technologies: string[];
  github?: string;
  demo?: string;
  repostedBy?: string;
  repostCount: number;
  recommendationCount: number;
  likeCount: number;
  score: number;
  comments: FeedComment[];
  isPopular?: boolean;
}

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(true);
const activeFilter = ref<FeedFilter>("Tous");
const searchQuery = ref("");
const openCommentPostId = ref<string | null>(null);
const commentDrafts = reactive<Record<string, string>>({});
const replyDrafts = reactive<Record<string, string>>({});
const repostedPosts = reactive<Record<string, boolean>>({});
const connectedPosts = reactive<Record<string, boolean>>({});
const likedPosts = reactive<Record<string, boolean>>({});
const likedComments = reactive<Record<number, boolean>>({});
const openReplyCommentId = ref<number | null>(null);
const savedFeedbackId = ref<string | null>(null);
const { isSaved, saveProfile } = useProSavedProfiles();

const filters: FeedFilter[] = ["Tous", "Projets", "Reposts", "Populaires", "Récents"];

const role = computed<FeedRole>(() => {
  if (route.path.startsWith("/prof")) return "prof";
  if (route.path.startsWith("/pro")) return "pro";
  return "student";
});

const headerUserType = computed<"student" | "professeur" | "professionnel">(() => {
  if (role.value === "prof") return "professeur";
  if (role.value === "pro") return "professionnel";
  return "student";
});

const posts = ref<FeedPost[]>([
  {
    id: "portfolio-web",
    studentId: "khadija-bennani",
    studentName: "Khadija Bennani",
    initials: "KB",
    school: "ENSA Tanger · GINF",
    time: "Il y a 12 min",
    projectTitle: "Portfolio Web",
    description:
      "Application portfolio moderne avec recommandations, projets, authentification et dashboard de suivi.",
    badges: ["🌐 Web Developer", "🔐 Security Aware", "🏆 Hackathon Participant"],
    technologies: ["Vue.js", "Node.js", "Docker", "PostgreSQL"],
    github: "github.com/khadija/portfolio-web",
    demo: "portfolio-demo.local",
    repostedBy: "Nom Prof",
    repostCount: 12,
    recommendationCount: 48,
    likeCount: 95,
    score: 90,
    isPopular: true,
    comments: [
      {
        id: 1,
        authorId: "sara-alaoui",
        authorName: "Sara Alaoui",
        initials: "SA",
        text: "Très propre, surtout la partie dashboard.",
        time: "Il y a 4 min",
        likeCount: 4,
        replies: [],
      },
    ],
  },
  {
    id: "stage-devops",
    studentId: "yassine-el-amrani",
    studentName: "Yassine El Amrani",
    initials: "YE",
    school: "ENSA Tanger · DevOps",
    time: "Il y a 1 h",
    projectTitle: "Pipeline CI/CD pour microservices",
    description:
      "Mise en place d'un pipeline CI/CD avec tests automatisés, Docker Compose et monitoring Prometheus.",
    badges: ["🌊 DevOps", "🔐 Security Aware"],
    technologies: ["Docker", "CI/CD", "GitLab", "Prometheus"],
    github: "github.com/yassine/devops-pipeline",
    repostCount: 5,
    recommendationCount: 31,
    likeCount: 44,
    score: 85,
    comments: [
      {
        id: 1,
        authorId: "amine-lahlou",
        authorName: "Amine Lahlou",
        initials: "AL",
        text: "Le choix Prometheus/Grafana est très pertinent.",
        time: "Il y a 25 min",
        likeCount: 2,
        replies: [],
      },
    ],
  },
  {
    id: "cloud-dashboard",
    studentId: "sara-alaoui",
    studentName: "Sara Alaoui",
    initials: "SA",
    school: "ENSA Tanger · Cloud",
    time: "Hier",
    projectTitle: "Cloud Cost Dashboard",
    description:
      "Dashboard pour suivre les coûts cloud, détecter les anomalies et proposer des optimisations.",
    badges: ["🧠 AI / Data", "🌐 Web Developer"],
    technologies: ["AWS", "Vue.js", "Python", "Figma"],
    demo: "cloud-cost-demo.local",
    repostedBy: "Nom Professionnel",
    repostCount: 18,
    recommendationCount: 76,
    likeCount: 130,
    score: 95,
    isPopular: true,
    comments: [],
  },
  {
    id: "mobile-ensa",
    studentId: "nora-tazi",
    studentName: "Nora Tazi",
    initials: "NT",
    school: "ENSA Tanger · Mobile",
    time: "Il y a 2 j",
    projectTitle: "Application Mobile ENSA",
    description:
      "Application mobile pour les annonces, événements, clubs et demandes administratives des étudiants.",
    badges: ["🌐 Web Developer", "🏆 Hackathon Participant"],
    technologies: ["Flutter", "Firebase", "Figma"],
    repostCount: 3,
    recommendationCount: 19,
    likeCount: 27,
    score: 80,
    comments: [],
  },
]);

const visiblePosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return posts.value.filter((post) => {
    const matchesFilter =
      activeFilter.value === "Tous" ||
      activeFilter.value === "Projets" ||
      (activeFilter.value === "Reposts" && post.repostedBy) ||
      (activeFilter.value === "Populaires" && post.isPopular) ||
      activeFilter.value === "Récents";

    const matchesSearch =
      !query ||
      post.studentName.toLowerCase().includes(query) ||
      post.projectTitle.toLowerCase().includes(query) ||
      post.technologies.some((technology) =>
        technology.toLowerCase().includes(query),
      );

    return matchesFilter && matchesSearch;
  });
});

const openStudentProfile = (studentId: string) => {
  router.push(`/profile/student/${studentId}`);
};

const openProject = (projectId: string) => {
  router.push(`/projects/${projectId}`);
};

const toggleSavedPostProfile = async (post: FeedPost) => {
  await saveProfile({
    id: post.studentId,
    name: post.studentName,
    school: post.school.split("·")[0]?.trim() || post.school,
    field: post.school.split("·")[1]?.trim() || "Projet",
    city: "Tanger",
    score: Math.min(95, Math.max(70, Math.round(post.recommendationCount + 20))),
    recommendations: post.recommendationCount,
    badges: post.badges,
    hasPortfolio: true,
    profilePath: `/profile/student/${post.studentId}`,
    portfolioPath: `/projects/${post.id}`,
  });

  savedFeedbackId.value = post.id;
  window.setTimeout(() => {
    if (savedFeedbackId.value === post.id) savedFeedbackId.value = null;
  }, 1200);
};

const toggleComments = (postId: string) => {
  openCommentPostId.value = openCommentPostId.value === postId ? null : postId;
};

const toggleRepost = (post: FeedPost) => {
  repostedPosts[post.id] = !repostedPosts[post.id];
  post.repostCount += repostedPosts[post.id] ? 1 : -1;
};

const toggleConnect = (postId: string) => {
  connectedPosts[postId] = !connectedPosts[postId];
};

const togglePostLike = (post: FeedPost) => {
  likedPosts[post.id] = !likedPosts[post.id];
  post.likeCount += likedPosts[post.id] ? 1 : -1;
};

const toggleCommentLike = (comment: FeedComment) => {
  likedComments[comment.id] = !likedComments[comment.id];
  comment.likeCount += likedComments[comment.id] ? 1 : -1;
};

const toggleReply = (commentId: number) => {
  openReplyCommentId.value =
    openReplyCommentId.value === commentId ? null : commentId;
};

const addComment = (post: FeedPost) => {
  const text = commentDrafts[post.id]?.trim();
  if (!text) return;

  post.comments.push({
    id: Date.now(),
    authorId: "current-user",
    authorName: "Vous",
    initials: "VO",
    text,
    time: "À l'instant",
    likeCount: 0,
    replies: [],
  });
  commentDrafts[post.id] = "";
};

const addReply = (comment: FeedComment) => {
  const text = replyDrafts[comment.id]?.trim();
  if (!text) return;

  comment.replies.push({
    id: Date.now(),
    authorId: "current-user",
    authorName: "Vous",
    initials: "VO",
    text,
    time: "À l'instant",
    likeCount: 0,
    replies: [],
  });
  replyDrafts[comment.id] = "";
  openReplyCommentId.value = null;
};

</script>

<template>
  <div class="feed-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarStudent v-if="role === 'student'" :isOpen="sidebarOpen" />
    <SidebarProf v-else-if="role === 'prof'" :isOpen="sidebarOpen" />
    <SidebarPro v-else :isOpen="sidebarOpen" />

    <main class="feed-shell" :class="{ 'feed-shellShift': sidebarOpen }">
      <section class="feed-column">
        <ExploreHeader v-model="searchQuery" :user-type="headerUserType" title="Fil d’actualité" />

        <div class="feed-filters">
          <button
            v-for="filter in filters"
            :key="filter"
            type="button"
            class="feed-filter"
            :class="{ active: activeFilter === filter }"
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <article v-for="post in visiblePosts" :key="post.id" class="feed-card">
          <div v-if="post.repostedBy" class="repost-line">
            {{ post.repostedBy }} a reposté ce projet
          </div>

          <div class="post-top">
            <button
              type="button"
              class="feed-avatar"
              @click="openStudentProfile(post.studentId)"
            >
              {{ post.initials }}
            </button>
            <div class="post-author-block">
              <div class="post-author-line">
                <button
                  type="button"
                  class="student-link"
                  @click="openStudentProfile(post.studentId)"
                >
                  {{ post.studentName }}
                </button>
                <span class="feed-score">
                  <span>*</span>{{ post.score }}+
                </span>
                <div class="post-profile-actions">
                  <button
                    type="button"
                    class="connect-button"
                    :class="{ active: connectedPosts[post.id] }"
                    @click="toggleConnect(post.id)"
                  >
                    {{
                      connectedPosts[post.id] ? "Demande envoyée" : "Connecter"
                    }}
                  </button>
                  <button
                    v-if="role === 'pro'"
                    type="button"
                    class="feed-save-btn"
                    :class="{ saved: isSaved(post.studentId) }"
                    :aria-label="
                      isSaved(post.studentId)
                        ? 'Retirer le profil sauvegardé'
                        : 'Sauvegarder le profil'
                    "
                    @click="toggleSavedPostProfile(post)"
                  >
                    <Bookmark class="feed-save-icon" />
                  </button>
                  <span v-if="savedFeedbackId === post.id" class="feed-save-feedback">
                    {{ isSaved(post.studentId) ? "Profil sauvegardé" : "Profil retiré" }}
                  </span>
                </div>
              </div>
              <p>{{ post.school }} · {{ post.time }}</p>
              <SkillBadges :badges="post.badges" compact />
            </div>
          </div>

          <button type="button" class="project-title" @click="openProject(post.id)">
            {{ post.projectTitle }}
          </button>
          <p class="project-description">{{ post.description }}</p>

          <div class="tag-row">
            <span v-for="technology in post.technologies" :key="technology">
              {{ technology }}
            </span>
          </div>

          <button type="button" class="project-preview" @click="openProject(post.id)">
            <span>{{ post.projectTitle }}</span>
          </button>

          <div class="link-row">
            <a v-if="post.github" href="#" @click.prevent>{{ post.github }}</a>
            <a v-if="post.demo" href="#" @click.prevent>{{ post.demo }}</a>
          </div>

          <div class="post-stats">
            <span>{{ post.likeCount }} j’aime</span>
            <span>{{ post.repostCount }} reposts</span>
            <span>{{ post.recommendationCount }} recommandations</span>
            <button
              type="button"
              class="comments-count"
              @click="toggleComments(post.id)"
            >
              {{ post.comments.length }} commentaires
            </button>
          </div>

          <div class="post-actions">
            <button
              type="button"
              :class="{ active: likedPosts[post.id] }"
              @click="togglePostLike(post)"
            >
              {{ likedPosts[post.id] ? "Aimé" : "J’aime" }}
            </button>
            <button type="button" @click="toggleComments(post.id)">Commenter</button>
            <button
              type="button"
              :class="{ active: repostedPosts[post.id] }"
              @click="toggleRepost(post)"
            >
              {{ repostedPosts[post.id] ? "Reposté" : "Reposter" }}
            </button>
          </div>

          <div v-if="openCommentPostId === post.id" class="comments-area">
            <div
              v-for="comment in post.comments"
              :key="comment.id"
              class="comment-item"
            >
              <button
                type="button"
                class="comment-avatar"
                @click="openStudentProfile(comment.authorId)"
              >
                {{ comment.initials }}
              </button>
              <div>
                <button
                  type="button"
                  class="comment-author"
                  @click="openStudentProfile(comment.authorId)"
                >
                  {{ comment.authorName }}
                </button>
                <p>{{ comment.text }}</p>
                <span>{{ comment.time }}</span>
                <div class="comment-actions">
                  <button
                    type="button"
                    :class="{ active: likedComments[comment.id] }"
                    @click="toggleCommentLike(comment)"
                  >
                    {{ likedComments[comment.id] ? "Aimé" : "J’aime" }}
                    <span v-if="comment.likeCount"> · {{ comment.likeCount }}</span>
                  </button>
                  <button type="button" @click="toggleReply(comment.id)">
                    Répondre
                  </button>
                </div>

                <div v-if="comment.replies.length" class="reply-list">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="comment-item reply-item"
                  >
                    <button
                      type="button"
                      class="comment-avatar"
                      @click="openStudentProfile(reply.authorId)"
                    >
                      {{ reply.initials }}
                    </button>
                    <div>
                      <button
                        type="button"
                        class="comment-author"
                        @click="openStudentProfile(reply.authorId)"
                      >
                        {{ reply.authorName }}
                      </button>
                      <p>{{ reply.text }}</p>
                      <span>{{ reply.time }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="openReplyCommentId === comment.id" class="reply-form">
                  <input
                    v-model="replyDrafts[comment.id]"
                    type="text"
                    placeholder="Répondre au commentaire..."
                    @keydown.enter="addReply(comment)"
                  />
                  <button type="button" @click="addReply(comment)">Répondre</button>
                </div>
              </div>
            </div>

            <div class="comment-form">
              <input
                v-model="commentDrafts[post.id]"
                type="text"
                placeholder="Ajouter un commentaire..."
                @keydown.enter="addComment(post)"
              />
              <button type="button" @click="addComment(post)">Publier</button>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.feed-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.feed-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 14px;
  transition: padding-left 0.3s ease;
}

.feed-shellShift {
  padding-left: 234px;
}

.feed-column {
  width: 100%;
  max-width: none;
  margin: 0;
  display: grid;
  gap: 12px;
}

.feed-header,
.feed-card {
  background: white;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.08);
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
}

.feed-kicker {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
}

.feed-header h1 {
  color: var(--text-dark);
  font-size: 30px;
  font-weight: 800;
}

.feed-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feed-search {
  position: relative;
  width: 360px;
}

.feed-search input {
  width: 100%;
  height: 36px;
  border-radius: 9999px;
  border: 1px solid var(--input-bg);
  background: var(--input-bg);
  color: var(--text-dark);
  padding: 0 42px 0 16px;
  font-size: 13px;
  font-weight: 700;
}

.feed-search input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}

.feed-search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  width: 17px;
  height: 17px;
  color: var(--text-gray);
  transform: translateY(-50%);
  pointer-events: none;
}

.feed-dropdown-wrap {
  position: relative;
  display: inline-flex;
}

.feed-notif,
.feed-language {
  height: 36px;
  border-radius: 9999px;
  color: white;
  box-shadow: 0 8px 18px rgba(122, 127, 136, 0.45);
}

.feed-notif {
  position: relative;
  width: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--purple);
}

.feed-notif-dot {
  position: absolute;
  right: -2px;
  top: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--error);
  box-shadow: 0 0 0 2px white;
}

.feed-language {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--blue-w);
  color: var(--text-dark);
  padding: 0 12px;
  font-weight: 800;
}

.feed-language span {
  min-width: 22px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  background: var(--input-bg);
  font-size: 10px;
}

.feed-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 40;
  background: white;
  border: 1px solid var(--input-bg);
  border-radius: 14px;
  box-shadow: 0 18px 38px rgba(17, 24, 39, 0.18);
}

.feed-notif-menu {
  width: 520px;
  max-width: calc(100vw - 40px);
  padding: 0;
  overflow: hidden;
}

.feed-notif-menu h2 {
  font-size: 18px;
  font-weight: 800;
  padding: 18px 18px 10px;
}

.feed-notif-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  padding: 0 18px 14px;
  border-bottom: 1px solid var(--input-bg);
}

.feed-notif-tab {
  height: 24px;
  border: 1px solid var(--text-gray);
  border-radius: 100px 180px 0px 100px;
  background: transparent;
  color: var(--text-gray);
  padding: 0 14px;
  font-size: 12px;
  font-weight: 800;
}

.feed-notif-tab.active {
  border: 2px solid var(--purple);
  background: var(--input-bg);
  color: var(--text-dark);
}

.feed-notif-list {
  height: min(360px, calc(100vh - 220px));
  min-height: 230px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px 8px 10px 10px;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--text-gray) var(--input-bg);
}

.feed-notif-list::-webkit-scrollbar {
  width: 14px;
}

.feed-notif-list::-webkit-scrollbar-track {
  background: var(--input-bg);
  border-radius: var(--radius-pill);
}

.feed-notif-list::-webkit-scrollbar-thumb {
  background: var(--text-gray);
  border: 4px solid var(--input-bg);
  border-radius: var(--radius-pill);
}

.feed-notif-item,
.feed-language-option {
  width: 100%;
  border-radius: 10px;
  background: transparent;
  color: var(--text-dark);
  padding: 10px;
  text-align: left;
  font-weight: 800;
}

.feed-notif-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 34px 12px 10px;
}

.feed-notif-item.unread {
  background: white;
}

.feed-notif-item:hover,
.feed-language-option:hover,
.feed-language-option.active {
  background: rgba(79, 70, 229, 0.12);
}

.feed-notif-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  font-size: 13px;
  font-weight: 900;
}

.feed-notif-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--text-dark);
  font-size: 13px;
  line-height: 1.35;
}

.feed-notif-copy strong {
  font-weight: 900;
}

.feed-notif-copy em {
  color: var(--purple);
  font-style: normal;
  font-weight: 900;
}

.feed-notif-copy small {
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 800;
}

.feed-item-dot {
  position: absolute;
  right: 14px;
  top: 20px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--purple);
}

.feed-notif-empty {
  padding: 28px 18px;
  color: var(--text-gray);
  font-weight: 800;
  text-align: center;
}

.feed-language-menu {
  min-width: 96px;
  padding: 6px;
}

.feed-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background: white;
  border-radius: var(--radius-card);
  padding: 14px;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
}

.feed-filter,
.connect-button,
.post-actions button,
.comment-form button {
  border-radius: 100px 180px 0px 100px;
  font-weight: 800;
}

.feed-filter,
.connect-button,
.post-actions button {
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: white;
  color: var(--text-gray);
}

.feed-filter {
  height: 34px;
  padding: 0 18px;
}

.feed-filter.active,
.connect-button.active,
.post-actions button.active,
.comment-form button {
  border-color: var(--purple);
  background: var(--purple);
  color: white;
}

.connect-button {
  height: 30px;
  padding: 0 14px;
  flex-shrink: 0;
  white-space: nowrap;
}

.feed-card {
  position: relative;
  padding: 18px;
}

.feed-save-btn {
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: white;
  color: var(--text-gray);
  border: 1px solid var(--input-bg);
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.feed-save-btn.saved {
  background: var(--purple);
  border-color: var(--purple);
  color: white;
}

.feed-save-icon {
  width: 16px;
  height: 16px;
}

.feed-save-feedback {
  border-radius: var(--radius-pill);
  background: var(--text-dark);
  color: white;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.2);
  white-space: nowrap;
}

.repost-line {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 12px;
}

.post-top,
.comment-item {
  display: flex;
  gap: 12px;
}

.post-author-block {
  flex: 1;
  min-width: 0;
}

.post-author-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.post-profile-actions {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.feed-score {
  color: var(--error);
  font-size: 14px;
  font-weight: 900;
  white-space: nowrap;
}

.feed-score span {
  position: relative;
  top: -3px;
  margin-right: 2px;
  font-size: 11px;
}

.feed-avatar,
.comment-avatar {
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 800;
}

.feed-avatar {
  width: 52px;
  height: 52px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
}

.student-link,
.project-title,
.comment-author {
  background: transparent;
  color: var(--text-dark);
  font-weight: 800;
  text-align: left;
}

.student-link:hover,
.project-title:hover,
.comment-author:hover {
  color: var(--purple);
}

.post-top p,
.post-stats,
.comment-item span {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 700;
}

.project-title {
  display: block;
  margin-top: 14px;
  color: var(--purple);
  font-size: 20px;
}

.project-description,
.comment-item p {
  color: var(--navy-mid);
  font-weight: 700;
  line-height: 1.55;
}

.tag-row,
.link-row,
.post-stats,
.post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-row span,
.link-row a {
  border-radius: var(--radius-pill);
  background: rgba(79, 70, 229, 0.12);
  color: var(--purple);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
}

.project-preview {
  width: 100%;
  height: 170px;
  border-radius: var(--radius-card);
  background: var(--input-bg);
  color: var(--text-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  font-weight: 800;
}

.post-stats,
.post-actions {
  border-top: 1px solid rgba(122, 127, 136, 0.25);
  padding-top: 12px;
}

.post-stats {
  justify-content: space-between;
}

.comments-count {
  background: transparent;
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
  padding: 0;
}

.comments-count:hover {
  color: var(--purple);
}

.post-actions button,
.comment-form button {
  padding: 8px 14px;
}

.post-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.post-actions button:hover,
.connect-button:hover,
.feed-filter:hover {
  background: rgba(79, 70, 229, 0.12);
  color: var(--text-dark);
}

.comments-area {
  display: grid;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(122, 127, 136, 0.25);
}

.comment-form {
  display: flex;
  gap: 8px;
}

.comment-form input,
.reply-form input {
  flex: 1;
  border-radius: var(--radius-pill);
  background: var(--input-bg);
  color: var(--text-dark);
  padding: 0 14px;
  font-weight: 700;
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.comment-actions button {
  background: transparent;
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 900;
  padding: 0;
}

.comment-actions button:hover,
.comment-actions button.active {
  color: var(--purple);
}

.reply-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.reply-item {
  padding-left: 8px;
}

.reply-form {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.reply-form input {
  height: 34px;
}

.reply-form button {
  border-radius: 100px 180px 0px 100px;
  background: var(--purple);
  color: white;
  padding: 8px 14px;
  font-weight: 800;
}

@media (max-width: 900px) {
  .feed-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .feed-header-actions,
  .feed-search {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .feed-shell,
  .feed-shellShift {
    padding: 12px;
  }
}
</style>

