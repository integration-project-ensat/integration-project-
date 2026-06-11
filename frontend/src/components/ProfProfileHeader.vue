<template>
  <div class="profile-header">
    <div class="cover-section">
      <div class="cover-img" />

      <div class="avatar-wrap">
        <div class="avatar" :class="avatarColorClass(profile.name)">
          <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" />
          <span v-else>{{ initials }}</span>
        </div>
      </div>
    </div>

    <div class="profile-info">
      <div class="name-row">
        <h1>{{ profile.name }}</h1>
      </div>

      <p class="title">{{ profile.title }}</p>
      <p class="school">{{ profile.school }}</p>

      <p class="location">
        {{ profile.location }}
        <button type="button" class="contact" @click="showContact = !showContact">
          - Contact info
        </button>
      </p>

      <button
        v-if="profile.recos"
        type="button"
        class="recos-summary"
        @click="emit('open-recos')"
      >
        <span class="recos-count">{{ profile.recos }} recos</span>

        <span class="recos-avatars">
          <span
            v-for="recommendation in recosPreview"
            :key="recommendation.id"
            class="recos-avatar"
            :class="avatarColorClass(recommendation.author)"
          >
            <img v-if="recommendation.avatar" :src="recommendation.avatar" alt="" />
            <span v-else>{{ getInitials(recommendation.author) }}</span>
          </span>
        </span>
      </button>

      <div class="prof-actions">
        <button type="button" class="action-btn validation" @click="emit('request-validation')">
          Demander une validation
        </button>

        <button type="button" class="action-btn connect" @click="emit('connect')">
          Connecter
        </button>

        <button type="button" class="action-btn share" @click="showShare = !showShare">
          Partager
        </button>
      </div>

      <div v-if="showContact" class="contact-section">
        <h3>Contact info</h3>

        <div class="contact-details">
          <div v-if="profile.email">
            <strong>Email:</strong>
            <a :href="'mailto:' + profile.email">{{ profile.email }}</a>
          </div>

          <div v-if="profile.website">
            <strong>Site:</strong>
            <a :href="profile.website" target="_blank" rel="noopener">
              {{ profile.website }}
            </a>
          </div>

          <div v-if="profile.linkedin">
            <strong>LinkedIn:</strong>
            <a :href="profile.linkedin" target="_blank" rel="noopener">
              Profil
            </a>
          </div>
        </div>
      </div>

      <div v-if="showShare" class="share-dropdown">
        <div class="share-card-internal">
          <h3>Partager ce profil</h3>
          <p class="share-subtitle">Copiez le lien ou partagez directement avec votre reseau.</p>

          <div class="link-box">
            <span>{{ profileUrl }}</span>
            <button type="button" class="copy-btn" @click="copyProfileLink">
              {{ copied ? "Copie" : "Copier" }}
            </button>
          </div>

          <div class="share-actions">
            <a :href="gmailShareUrl" target="_blank" rel="noopener" class="share-card-btn gmail">
              <div class="icon-wrapper">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <span>Gmail</span>
            </a>

            <a :href="linkedinShareUrl" target="_blank" rel="noopener" class="share-card-btn linkedin">
              <div class="icon-wrapper">
                <i class="fa-brands fa-linkedin-in"></i>
              </div>
              <span>LinkedIn</span>
            </a>

            <a :href="whatsappShareUrl" target="_blank" rel="noopener" class="share-card-btn whatsapp">
              <div class="icon-wrapper">
                <i class="fa-brands fa-whatsapp"></i>
              </div>
              <span>WhatsApp</span>
            </a>

            <a :href="xShareUrl" target="_blank" rel="noopener" class="share-card-btn x-twitter">
              <div class="icon-wrapper">
                <i class="fa-brands fa-x-twitter"></i>
              </div>
              <span>X</span>
            </a>
          </div>
        </div>
      </div>

      <div class="prof-summary">
        <article class="summary-card">
          <span>Role</span>
          <strong>{{ profile.title }}</strong>
        </article>

        <article class="summary-card">
          <span>Etablissement</span>
          <strong>{{ profile.school }}</strong>
        </article>

        <article class="summary-card">
          <span>Localisation</span>
          <strong>{{ profile.location }}</strong>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type Recommendation = {
  id: number;
  author: string;
  avatar?: string;
  message?: string;
  date?: string;
};

const props = defineProps<{
  profile: {
    name: string;
    score?: number;
    title: string;
    school: string;
    location: string;
    recos?: string;
    avatar?: string;
    email?: string;
    website?: string;
    linkedin?: string;
  };
  recentRecommendations?: Recommendation[];
}>();

const emit = defineEmits<{
  (e: "request-validation"): void;
  (e: "connect"): void;
  (e: "open-recos"): void;
}>();

const showContact = ref(false);
const showShare = ref(false);
const copied = ref(false);

const recosPreview = computed(() => props.recentRecommendations?.slice(0, 3) ?? []);
const initials = computed(() => getInitials(props.profile.name));
const profileUrl = computed(() => window.location.href);
const encodedProfileUrl = computed(() => encodeURIComponent(profileUrl.value));
const encodedShareText = computed(() => encodeURIComponent(`Decouvrez le profil de ${props.profile.name}`));

const gmailShareUrl = computed(() => `mailto:?subject=${encodedShareText.value}&body=${encodedShareText.value}%0A${encodedProfileUrl.value}`);
const linkedinShareUrl = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodedProfileUrl.value}`);
const whatsappShareUrl = computed(() => `https://wa.me/?text=${encodedShareText.value}%20${encodedProfileUrl.value}`);
const xShareUrl = computed(() => `https://twitter.com/intent/tweet?text=${encodedShareText.value}&url=${encodedProfileUrl.value}`);

async function copyProfileLink() {
  await navigator.clipboard.writeText(profileUrl.value);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1600);
}

function avatarColorClass(name: string) {
  const colors = [
    "avatar-blue",
    "avatar-orange",
    "avatar-indigo",
    "avatar-green",
    "avatar-deep-blue",
    "avatar-brown",
    "avatar-purple",
    "avatar-slate",
  ];

  const sum = name.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
</script>

<style scoped>
.profile-header {
  background: var(--white);
  border-radius: 14px;
  margin-top: 35px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 14px 38px rgba(15, 23, 42, .08);
}

.cover-section {
  position: relative;
  margin-bottom: 56px;
  isolation: isolate;
}

.cover-img {
  width: 100%;
  height: 190px;
  background-color: #eef5ff;
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, .9) 0%, rgba(255, 255, 255, .14) 38%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(circle at 86% 18%, rgba(3, 155, 229, .34) 0%, rgba(3, 155, 229, .11) 36%, transparent 62%),
    radial-gradient(circle at 18% 78%, rgba(94, 53, 177, .2) 0%, rgba(94, 53, 177, .08) 42%, transparent 66%),
    radial-gradient(var(--text-subtle) .85px, transparent .85px),
    radial-gradient(#cbd5e1 .85px, transparent .85px),
    linear-gradient(120deg, #f8fbff 0%, #eaf4ff 46%, #f6f2ff 100%);
  background-size: 100% 100%, 100% 100%, 100% 100%, 22px 22px, 22px 22px, 100% 100%;
  background-position: 0 0, 0 0, 0 0, 0 0, 11px 11px, 0 0;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(148, 163, 184, .26);
  border-radius: 0 0 34px 34px / 0 0 18px 18px;
  clip-path: ellipse(116% 100% at 50% 0%);
}

.cover-img::before,
.cover-img::after {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
}

.cover-img::before {
  width: 290px;
  height: 88px;
  right: -42px;
  top: 34px;
  background: linear-gradient(90deg, rgba(3, 155, 229, .2), rgba(94, 53, 177, .12));
  transform: rotate(-13deg);
}

.cover-img::after {
  width: 230px;
  height: 70px;
  left: -64px;
  bottom: 18px;
  background: linear-gradient(90deg, rgba(94, 53, 177, .14), rgba(3, 155, 229, .14));
  transform: rotate(16deg);
}

.cover-section::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 64px;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), var(--white) 78%);
}

.avatar-wrap {
  position: absolute;
  z-index: 2;
  bottom: -50px;
  left: 24px;
  padding: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .8);
  box-shadow: 0 14px 32px rgba(15, 23, 42, .14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid var(--white);
  background: var(--avatar-bg, var(--sky));
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: 1.5rem;
  font-weight: 700;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
}

.avatar img,
.recos-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  padding: 0 24px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

h1 {
  font-family: var(--font-head);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
}

.score {
  color: var(--error);
  font-size: 1.1rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  font-family: var(--font-head);
}

.title,
.school,
.location {
  color: var(--text-dark);
  font-size: .82rem;
  margin-bottom: 3px;
}

.contact {
  border: 0;
  background: transparent;
  color: var(--purple);
  cursor: pointer;
  font: inherit;
  padding: 0;
}

.contact:hover,
.recos-summary:hover .recos-count {
  text-decoration: underline;
}

.recos-summary {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0 0 12px;
  cursor: pointer;
  line-height: 1;
}

.recos-count {
  display: inline-flex;
  align-items: center;
  height: 26px;
  font-size: .9rem;
  font-weight: 700;
  color: var(--purple);
  line-height: 1;
}

.recos-avatars {
  display: inline-flex;
  align-items: center;
  height: 26px;
}

.recos-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--avatar-bg, var(--sky));
  border: 2px solid var(--white);
  color: var(--white);
  font-family: var(--font-head);
  font-size: .58rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-left: -6px;
  line-height: 1;
}

.recos-avatar:first-child {
  margin-left: 0;
}

.prof-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  border-top: 1px solid var(--border-neutral);
  padding: 12px 0 10px;
  overflow-x: auto;
}

.action-btn {
  min-width: 150px;
  height: 40px;
  padding: 0 22px;
  background: var(--white);
  border: 2px solid #8d8d8d;
  color: var(--text-dim);
  font-family: var(--font-head);
  font-size: .9rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--ease);
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.validation {
  min-width: 220px;
  background: var(--purple);
  border-color: var(--purple);
  color: var(--white);
  border-radius: 100px 180px 0 100px;
}

.action-btn.connect,
.action-btn.share {
  border-radius: 180px 100px 100px 0;
}

.action-btn:hover:not(.validation) {
  border-color: var(--purple);
  color: var(--purple);
}

.action-btn.validation:hover {
  background: var(--purple-hover, var(--purple-hover));
  border-color: var(--purple-hover, var(--purple-hover));
}

.contact-section,
.share-dropdown {
  border-top: 1px solid var(--border-neutral);
  padding: 14px 0 18px;
}

.contact-section h3,
.share-card-internal h3 {
  font-size: .85rem;
  font-weight: 700;
  margin-bottom: 14px;
  font-family: var(--font-head);
  color: var(--text-dark);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: .82rem;
  color: var(--text-muted);
}

.contact-details a {
  color: var(--purple);
}

.share-card-internal {
  background: var(--white);
}

.share-subtitle {
  font-size: .85rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.link-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-subtle);
  border: 1px solid var(--input-bg);
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 20px;
}

.link-box span {
  flex: 1;
  min-width: 0;
  font-size: .85rem;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  min-height: 34px;
  padding: 0 16px;
  border-radius: 50px 50px 0 50px;
  background: var(--purple);
  color: var(--white);
  font-family: var(--font-head);
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.share-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.share-card-btn {
  flex: 1;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 12px;
  border-radius: 12px;
  background: var(--white);
  border: 1px solid #eef2f6;
  text-decoration: none;
  transition: all .25s cubic-bezier(.4, 0, .2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, .02);
}

.share-card-btn span {
  font-family: var(--font-head);
  font-size: .85rem;
  font-weight: 600;
  color: #4b5563;
  transition: color .2s ease;
}

.icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--white);
  transition: transform .25s ease, box-shadow .25s ease;
}

.share-card-btn.gmail .icon-wrapper {
  background: linear-gradient(135deg, #ff5252, #e53935);
  box-shadow: 0 4px 10px rgba(229, 57, 53, .2);
}

.share-card-btn.linkedin .icon-wrapper {
  background: linear-gradient(135deg, #0077b5, #00598a);
  box-shadow: 0 4px 10px rgba(0, 119, 181, .2);
}

.share-card-btn.whatsapp .icon-wrapper {
  background: linear-gradient(135deg, var(--brand-whatsapp), #1ebd59);
  box-shadow: 0 4px 10px rgba(37, 211, 102, .2);
}

.share-card-btn.x-twitter .icon-wrapper {
  background: linear-gradient(135deg, #2d3748, #0f1419);
  box-shadow: 0 4px 10px rgba(15, 20, 25, .2);
}

.share-card-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, .05);
}

.share-card-btn:hover .icon-wrapper {
  transform: scale(1.08);
}

.share-card-btn:hover span {
  color: var(--navy);
}

.prof-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 0 20px;
  border-top: 1px solid var(--border-neutral);
  margin-top: 8px;
}

.summary-card {
  background: var(--white);
  border-radius: 8px;
  padding: 14px;
  min-height: 70px;
  box-shadow: 0 2px 8px var(--overlay-black-08);
}

.summary-card span {
  display: block;
  font-size: .78rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 600;
}

.summary-card strong {
  color: var(--text-dark);
  font-size: .86rem;
  line-height: 1.35;
}

.avatar-blue { --avatar-bg: var(--sky); }
.avatar-orange { --avatar-bg: var(--tech-amber); }
.avatar-indigo { --avatar-bg: var(--tech-slate); }
.avatar-green { --avatar-bg: var(--tech-green); }
.avatar-deep-blue { --avatar-bg: var(--tech-blue); }
.avatar-brown { --avatar-bg: var(--tech-brown); }
.avatar-purple { --avatar-bg: var(--tech-deep-purple); }
.avatar-slate { --avatar-bg: var(--tech-periwinkle); }

@media (max-width: 768px) {
  .profile-header {
    border-radius: 12px;
  }

  .cover-section {
    margin-bottom: 50px;
  }

  .cover-img {
    height: 158px;
    clip-path: ellipse(130% 100% at 50% 0%);
  }

  .cover-img::before {
    width: 210px;
    height: 68px;
    right: -76px;
    top: 28px;
  }

  .cover-img::after {
    width: 180px;
    height: 58px;
    left: -86px;
    bottom: 20px;
  }

  .avatar-wrap {
    left: 18px;
    bottom: -46px;
  }

  .avatar {
    width: 88px;
    height: 88px;
  }

  .prof-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-info {
    padding: 0 18px;
  }

  .share-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
