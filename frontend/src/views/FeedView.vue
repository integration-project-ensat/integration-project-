<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Bookmark } from "../lib/icons";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import ExploreHeader from "../components/exploreStudent/ExploreHeader.vue";
import SidebarStudent from "../components/exploreStudent/Sidebar.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import PostFormModal from "../components/PostFormModal.vue";
import { connexionService } from "../services/connexion.service";
import { feedService } from "../services/feed.service";
import { useProSavedProfiles } from "../store/proSavedProfiles";
import { resolveProfileBadges } from "../utils/profileBadges";

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
  imagePreview?: string | null;
  collaborators?: string[];
  viewerHasLiked?: boolean;
  viewerHasReposted?: boolean;
}

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(true);
const activeFilter = ref<FeedFilter>("Tous");
const searchQuery = ref("");
const openCommentPostId = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const getCurrentUser = () => {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const getCurrentUserId = () => {
  const user = getCurrentUser();
  const id = user?.id ?? user?.id_utilisateur;
  return id == null ? "" : String(id);
};

const getCurrentUserName = () => {
  const user = getCurrentUser();
  return user?.name || [user?.prenom, user?.nom].filter(Boolean).join(" ").trim() || "Vous";
};

const myStudentId = ref(getCurrentUserId());

// ID de l'utilisateur connecté (pour afficher edit/delete sur ses propres posts)
// Post form modal
const showPostModal  = ref(false);
const editingPost    = ref<FeedPost | null>(null);
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

const profileContextQuery = computed(() => {
  if (role.value === "prof") return "?from=prof";
  if (role.value === "pro") return "?from=pro";
  return "?from=student";
});

const posts = ref<FeedPost[]>([]);

const toInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatRelativeDate = (dateValue?: string | null) => {
  if (!dateValue) return "Recemment";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recemment";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return date.toLocaleDateString("fr-FR");
};

const parseStructuredContent = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
};

const buildBadges = (post: any) =>
  resolveProfileBadges({
    badges: post.auteur?.etudiant?.badges,
    competences: post.auteur?.etudiant?.competences,
    filiere: post.auteur?.etudiant?.filiere,
    bio: post.auteur?.profil?.bio,
  });

const mapComment = (comment: any): FeedComment => {
  const authorName =
    [comment.auteur?.prenom, comment.auteur?.nom].filter(Boolean).join(" ").trim() ||
    "Utilisateur";

  return {
    id: Number(comment.id_commentaire),
    authorId: String(comment.auteur?.id_utilisateur ?? ""),
    authorName,
    initials: toInitials(authorName),
    text: comment.contenu,
    time: formatRelativeDate(comment.date),
    likeCount: 0,
    replies: [],
  };
};

const mapPost = (post: any): FeedPost => {
  const structured = parseStructuredContent(post.contenu);
  const studentName =
    [post.auteur?.prenom, post.auteur?.nom].filter(Boolean).join(" ").trim() ||
    "Etudiant";
  const school = [post.auteur?.profil?.adresse, post.auteur?.etudiant?.filiere || post.auteur?.role]
    .filter(Boolean)
    .join(" · ");
  const technologies = Array.isArray(structured?.technologies)
    ? structured.technologies.filter(Boolean)
    : [];
  const likeCount = Object.values(post.compteurs_reactions || {}).reduce(
    (sum: number, count: any) => sum + Number(count || 0),
    0,
  );
  const recommendationCount = post.auteur?.etudiant?.recommandations_recues?.length ?? 0;
  const score = Number(post.auteur?.etudiant?.score_credibilite?.score_total ?? 0);

  return {
    id: String(post.id_poste),
    studentId: String(post.auteur?.id_utilisateur ?? ""),
    studentName,
    initials: toInitials(studentName),
    school: school || "Maroc",
    time: formatRelativeDate(post.date_creation),
    projectTitle:
      structured?.projectTitle ||
      post.contenu.split("\n")[0]?.slice(0, 70) ||
      "Publication",
    description: structured?.description || post.contenu,
    badges: buildBadges(post),
    technologies,
    github: structured?.github,
    demo: structured?.demo,
    repostedBy: post.reposts?.[0]?.auteur
      ? [post.reposts[0].auteur.prenom, post.reposts[0].auteur.nom].filter(Boolean).join(" ")
      : undefined,
    repostCount: Number(post.compteur_reposts ?? 0),
    recommendationCount,
    likeCount,
    score,
    comments: Array.isArray(post.commentaires) ? post.commentaires.map(mapComment) : [],
    isPopular: score >= 85 || recommendationCount >= 10 || likeCount >= 15,
    imagePreview: post.image_url || null,
    collaborators:
      structured?.collaboratorsNames ||
      post.collaborateurs?.map((item: any) =>
        [item.utilisateur?.prenom, item.utilisateur?.nom].filter(Boolean).join(" ").trim(),
      ) ||
      [],
    viewerHasLiked: Array.isArray(post.reactions)
      ? post.reactions.some(
          (reaction: any) => String(reaction.auteur?.id_utilisateur ?? "") === myStudentId.value,
        )
      : false,
    viewerHasReposted: Array.isArray(post.reposts)
      ? post.reposts.some(
          (repost: any) => String(repost.auteur?.id_utilisateur ?? "") === myStudentId.value,
        )
      : false,
  };
};

const syncInteractionState = (items: FeedPost[]) => {
  Object.keys(likedPosts).forEach((key) => delete likedPosts[key]);
  Object.keys(repostedPosts).forEach((key) => delete repostedPosts[key]);

  items.forEach((post) => {
    if (post.viewerHasLiked) likedPosts[post.id] = true;
    if (post.viewerHasReposted) repostedPosts[post.id] = true;
  });
};

const loadPosts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await feedService.getPosts();
    const items = Array.isArray(response.data?.data)
      ? response.data.data.map(mapPost)
      : [];
    posts.value = items;
    syncInteractionState(items);
  } catch (err: any) {
    if (err?.response?.status === 401) {
      router.push('/login');
      return;
    }
    error.value =
      err?.response?.data?.message || "Erreur lors du chargement du fil d’actualité";
  } finally {
    loading.value = false;
  }
};

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
  router.push(`/profile/student/${studentId}${profileContextQuery.value}`);
};

const openProject = (projectId: string) => {
  router.push(`/projects/${projectId}?from=${role.value}`);
};

const toggleSavedPostProfile = (post: FeedPost) => {
  const saved = saveProfile({
    id: post.studentId,
    name: post.studentName,
    school: post.school.split("·")[0]?.trim() || post.school,
    field: post.school.split("·")[1]?.trim() || "Projet",
    city: "Tanger",
    score: Math.min(95, Math.max(70, Math.round(post.recommendationCount + 20))),
    recommendations: post.recommendationCount,
    badges: post.badges,
    hasPortfolio: true,
    profilePath: `/profile/student/${post.studentId}${profileContextQuery.value}`,
    portfolioPath: `/portfolio/${post.studentId}${profileContextQuery.value}`,
  });

  savedFeedbackId.value = post.id;
  window.setTimeout(() => {
    if (savedFeedbackId.value === post.id) savedFeedbackId.value = null;
  }, 1200);
};

const toggleComments = (postId: string) => {
  openCommentPostId.value = openCommentPostId.value === postId ? null : postId;
};

const toggleRepost = async (post: FeedPost) => {
  try {
    if (repostedPosts[post.id]) {
      await feedService.removeRepost(post.id);
    } else {
      await feedService.repostPost(post.id);
    }
    await loadPosts();
  } catch {
    error.value = "Impossible de mettre a jour le repost.";
  }
};

const toggleConnect = async (post: FeedPost) => {
  if (!post.studentId || post.studentId === myStudentId.value) return;
  if (connectedPosts[post.id]) return;

  try {
    await connexionService.createConnexion({
      userId: post.studentId,
      id_destinataire: post.studentId,
      message: `Demande de connexion vers ${post.studentName}`,
    });
    connectedPosts[post.id] = true;
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || "Impossible d’envoyer la demande de connexion.";
  }
};

const togglePostLike = async (post: FeedPost) => {
  try {
    if (likedPosts[post.id]) {
      await feedService.unlikePost(post.id);
    } else {
      await feedService.likePost(post.id);
    }
    await loadPosts();
  } catch {
    error.value = "Impossible de mettre a jour le j’aime.";
  }
};

const toggleCommentLike = (comment: FeedComment) => {
  likedComments[comment.id] = !likedComments[comment.id];
  comment.likeCount += likedComments[comment.id] ? 1 : -1;
};

const toggleReply = (commentId: number) => {
  openReplyCommentId.value =
    openReplyCommentId.value === commentId ? null : commentId;
};

const addComment = async (post: FeedPost) => {
  const text = commentDrafts[post.id]?.trim();
  if (!text) return;

  try {
    await feedService.createComment(post.id, text);
    post.comments.unshift({
      id: Date.now(),
      authorId: myStudentId.value || "current-user",
      authorName: getCurrentUserName(),
      initials: toInitials(getCurrentUserName()),
      text,
      time: "A l'instant",
      likeCount: 0,
      replies: [],
    });
    commentDrafts[post.id] = "";
  } catch {
    error.value = "Impossible d’ajouter le commentaire.";
  }
};

const addReply = (comment: FeedComment) => {
  const text = replyDrafts[comment.id]?.trim();
  if (!text) return;

  comment.replies.push({
    id: Date.now(),
    authorId: myStudentId.value || "current-user",
    authorName: getCurrentUserName(),
    initials: toInitials(getCurrentUserName()),
    text,
    time: "A l'instant",
    likeCount: 0,
    replies: [],
  });
  replyDrafts[comment.id] = "";
  openReplyCommentId.value = null;
};

// ── Gestion des posts (CRUD) ──

function openNewPost() {
  editingPost.value = null;
  showPostModal.value = true;
}

function openEditPost(post: FeedPost) {
  editingPost.value = post;
  showPostModal.value = true;
}
async function deletePost(id: string) {
  if (!confirm("Supprimer ce post définitivement ?")) return;

  try {
    await feedService.deletePost(id);
    posts.value = posts.value.filter((p) => p.id !== id);
  } catch {
    error.value = "Impossible de supprimer ce post.";
  }
}

async function handleSavePost(data: Record<string, any>) {
  const payload = {
    contenu: JSON.stringify({
      projectTitle: data.projectTitle,
      description: data.description,
      technologies: data.technologies,
      github: data.github,
      demo: data.demo,
      collaboratorsNames: data.collaborators || [],
    }),
    imageFile: data.imageFile || undefined,
  };

  try {
    if (editingPost.value) {
      await feedService.updatePost(editingPost.value.id, payload);
    } else {
      await feedService.createPost(payload);
    }

    showPostModal.value = false;
    editingPost.value = null;
    await loadPosts();
  } catch {
    error.value = "Impossible d’enregistrer ce post.";
  }
}

onMounted(() => {
  loadPosts();
});
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

        <!-- Bouton nouveau post -->
        <div class="new-post-bar">
          <button class="btn-new-post" @click="openNewPost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau post
          </button>
        </div>

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

        <div v-if="loading" class="feed-state">Chargement...</div>
        <div v-else-if="error" class="feed-state feed-state--error">{{ error }}</div>
        <div v-else-if="!visiblePosts.length" class="feed-state">Aucun post trouvé.</div>

        <article v-for="post in !loading && !error ? visiblePosts : []" :key="post.id" class="feed-card">
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
                  <!-- Boutons edit / delete visibles seulement sur les posts de l'utilisateur connecté -->
                  <template v-if="post.studentId === myStudentId">
                    <button type="button" class="post-owner-btn" @click="openEditPost(post)" title="Modifier">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button type="button" class="post-owner-btn delete" @click="deletePost(post.id)" title="Supprimer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </template>
                  <button
                    type="button"
                    class="connect-button"
                    :class="{ active: connectedPosts[post.id] }"
                    :disabled="post.studentId === myStudentId || connectedPosts[post.id]"
                    @click="toggleConnect(post)"
                  >
                    {{
                      post.studentId === myStudentId
                        ? "Mon profil"
                        : connectedPosts[post.id]
                          ? "Demande envoyée"
                          : "Connecter"
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

          <!-- Image du projet (si uploadée) ou placeholder cliquable -->
          <button v-if="post.imagePreview" type="button" class="project-preview has-image" @click="openProject(post.id)">
            <img :src="post.imagePreview" :alt="post.projectTitle" class="post-image" />
          </button>
          <button v-else type="button" class="project-preview" @click="openProject(post.id)">
            <span>{{ post.projectTitle }}</span>
          </button>

          <!-- Collaborateurs (si post en collaboration) -->
          <div v-if="post.collaborators && post.collaborators.length" class="collab-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span>Collaboration :</span>
            <span v-for="(name, i) in post.collaborators" :key="i" class="collab-tag">{{ name }}</span>
          </div>

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

  <!-- Modal de création / édition de post -->
  <PostFormModal
    :visible="showPostModal"
    :post="editingPost"
    @save="handleSavePost"
    @close="showPostModal = false"
  />
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

.feed-state {
  background: white;
  border-radius: var(--radius-card);
  padding: 20px;
  color: var(--text-gray);
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
}

.feed-state--error {
  color: var(--error);
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

/* ── Nouveau post bar ── */
.new-post-bar {
  display: flex;
  justify-content: flex-end;
}

.btn-new-post {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--purple);
  color: white;
  border: none;
  border-radius: var(--radius-pill);
  padding: 9px 20px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  font-family: var(--font-head);
  transition: var(--ease);
}
.btn-new-post:hover { background: var(--navy-mid); }

/* ── Boutons owner (edit / delete) sur les posts ── */
.post-owner-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--input-bg);
  color: var(--text-gray);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--ease);
  flex-shrink: 0;
}
.post-owner-btn:hover { background: rgba(79,70,229,0.1); color: var(--purple); border-color: var(--purple); }
.post-owner-btn.delete:hover { background: rgba(223,30,33,0.08); color: var(--error); border-color: var(--error); }

/* ── Image du post ── */
.project-preview.has-image {
  height: auto;
  padding: 0;
  overflow: hidden;
  background: none;
}

.post-image {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: var(--radius-card);
  display: block;
}

/* ── Collaborateurs ── */
.collab-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-gray);
  font-weight: 700;
}

.collab-tag {
  background: rgba(79,70,229,0.1);
  color: var(--purple);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
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

