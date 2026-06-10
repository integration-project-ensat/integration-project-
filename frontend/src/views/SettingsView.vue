<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SidebarStudent v-if="settingsRole === 'student'" :isOpen="sidebarOpen" />

      <SidebarProf
        v-else-if="settingsRole === 'teacher'"
        :isOpen="sidebarOpen"
      />

      <SidebarAdmin v-else-if="settingsRole === 'admin'" :open="sidebarOpen" />

      <SidebarPro v-else :isOpen="sidebarOpen" />

      <main class="content" :class="{ shifted: sidebarOpen }">
        <section class="page-head">
          <div>
            <h1>Paramètres</h1>
            <p>{{ pageDescription }}</p>
          </div>
        </section>

        <div class="settings-layout">
          <nav class="settings-nav">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="nav-item"
              :class="{ active: activeTab === tab.value }"
              @click="activeTab = tab.value"
            >
              <span class="nav-icon" v-html="tab.icon"></span>
              {{ tab.label }}
            </button>
          </nav>

          <div class="settings-panel">
            <!-- ── Compte ────────────────────────────────────────────── -->
            <div v-if="activeTab === 'account'">
              <h2 class="panel-title">Informations du compte</h2>

              <!-- Email -->
              <div class="settings-card">
                <div class="card-head">
                  <div class="card-icon email-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3>Adresse e-mail</h3>
                    <p class="current-value">{{ currentUser.email }}</p>
                  </div>
                  <div class="card-action">
                    <button
                      v-if="!showEmailForm"
                      class="btn-outline"
                      @click="showEmailForm = true"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
                <div v-if="showEmailForm" class="inline-form">
                  <div class="form-field">
                    <label>Nouvel e-mail</label>
                    <input
                      v-model="emailForm.newEmail"
                      type="email"
                      placeholder="nouveau@email.com"
                    />
                  </div>
                  <div class="form-field">
                    <label>Confirmer l'e-mail</label>
                    <input
                      v-model="emailForm.confirmEmail"
                      type="email"
                      placeholder="nouveau@email.com"
                    />
                  </div>
                  <div class="form-field">
                    <label>Mot de passe actuel</label>
                    <input
                      v-model="emailForm.password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div v-if="emailError" class="form-error">
                    {{ emailError }}
                  </div>
                  <div v-if="emailSuccess" class="form-success">
                    {{ emailSuccess }}
                  </div>
                  <div class="form-actions">
                    <button class="btn-save" @click="saveEmail">
                      Enregistrer
                    </button>
                    <button class="btn-secondary" @click="cancelEmail">
                      Annuler
                    </button>
                  </div>
                </div>
              </div>

              <!-- Password -->
              <div class="settings-card">
                <div class="card-head">
                  <div class="card-icon lock-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3>Mot de passe</h3>
                    <p class="current-value">
                      Dernière modification : il y a 3 mois
                    </p>
                  </div>
                  <div class="card-action">
                    <button
                      v-if="!showPasswordForm"
                      class="btn-outline"
                      @click="showPasswordForm = true"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
                <div v-if="showPasswordForm" class="inline-form">
                  <div class="form-field">
                    <label>Mot de passe actuel</label>
                    <div class="input-eye">
                      <input
                        v-model="passwordForm.current"
                        :type="showCurrent ? 'text' : 'password'"
                        placeholder="••••••••"
                      />
                      <button
                        class="eye-btn"
                        @click="showCurrent = !showCurrent"
                      >
                        <svg
                          v-if="!showCurrent"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <svg
                          v-else
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="form-field">
                    <label>Nouveau mot de passe</label>
                    <div class="input-eye">
                      <input
                        v-model="passwordForm.newPass"
                        :type="showNew ? 'text' : 'password'"
                        placeholder="••••••••"
                      />
                      <button class="eye-btn" @click="showNew = !showNew">
                        <svg
                          v-if="!showNew"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <svg
                          v-else
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      </button>
                    </div>
                    <div class="strength-bar" v-if="passwordForm.newPass">
                      <div
                        class="strength-fill"
                        :style="{
                          width: strength.pct + '%',
                          background: strength.color,
                        }"
                      ></div>
                    </div>
                    <span
                      v-if="passwordForm.newPass"
                      class="strength-label"
                      :style="{ color: strength.color }"
                    >
                      {{ strength.label }}
                    </span>
                  </div>
                  <div class="form-field">
                    <label>Confirmer le nouveau mot de passe</label>
                    <input
                      v-model="passwordForm.confirm"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div v-if="passwordError" class="form-error">
                    {{ passwordError }}
                  </div>
                  <div v-if="passwordSuccess" class="form-success">
                    {{ passwordSuccess }}
                  </div>
                  <div class="form-actions">
                    <button class="btn-save" @click="savePassword">
                      Enregistrer
                    </button>
                    <button class="btn-secondary" @click="cancelPassword">
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Activité ──────────────────────────────────────────── -->
            <div v-if="!isAccountOnly && activeTab === 'activity'">
              <h2 class="panel-title">Activité sur la plateforme</h2>

              <div class="activity-tabs">
                <button
                  v-for="t in activityTabs"
                  :key="t.value"
                  class="act-tab"
                  :class="{ active: activeActivityTab === t.value }"
                  @click="activeActivityTab = t.value"
                >
                  <span v-html="t.icon"></span>
                  {{ t.label }}
                  <span class="act-count">{{
                    getActivityList(t.value).length
                  }}</span>
                </button>
              </div>

              <!-- Liked -->
              <div v-if="activeActivityTab === 'liked'" class="activity-list">
                <div v-if="likedItems.length === 0" class="act-empty">
                  Aucun élément aimé.
                </div>
                <div
                  v-for="item in likedItems"
                  :key="item.id"
                  class="activity-item"
                >
                  <div class="act-thumb" :style="{ background: item.color }">
                    <span v-html="item.icon"></span>
                  </div>
                  <div class="act-info">
                    <div class="act-title">{{ item.title }}</div>
                    <div class="act-sub">
                      {{ item.author }} · {{ item.date }}
                    </div>
                  </div>
                  <div class="act-type-badge" :style="badgeStyleAct(item.type)">
                    {{ item.type }}
                  </div>
                  <button
                    class="act-unlike"
                    @click="removeActivity('liked', item.id)"
                    title="Retirer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Commented -->
              <div
                v-if="activeActivityTab === 'commented'"
                class="activity-list"
              >
                <div v-if="commentedItems.length === 0" class="act-empty">
                  Aucun commentaire.
                </div>
                <div
                  v-for="item in commentedItems"
                  :key="item.id"
                  class="activity-item"
                >
                  <div class="act-thumb" :style="{ background: item.color }">
                    <span v-html="item.icon"></span>
                  </div>
                  <div class="act-info">
                    <div class="act-title">{{ item.title }}</div>
                    <div v-if="item.comment" class="act-comment-text">
                      "{{ item.comment }}"
                    </div>
                    <div class="act-sub">
                      {{ item.author }} · {{ item.date }}
                    </div>
                  </div>
                  <div class="act-type-badge" :style="badgeStyleAct(item.type)">
                    {{ item.type }}
                  </div>
                  <button
                    class="act-unlike"
                    @click="removeActivity('commented', item.id)"
                    title="Retirer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Saved -->
              <div v-if="activeActivityTab === 'saved'" class="activity-list">
                <div v-if="savedItems.length === 0" class="act-empty">
                  Aucun contenu enregistré.
                </div>
                <div
                  v-for="item in savedItems"
                  :key="item.id"
                  class="activity-item"
                >
                  <div class="act-thumb" :style="{ background: item.color }">
                    <span v-html="item.icon"></span>
                  </div>
                  <div class="act-info">
                    <div class="act-title">{{ item.title }}</div>
                    <div class="act-sub">
                      {{ item.author }} · {{ item.date }}
                    </div>
                  </div>
                  <div class="act-type-badge" :style="badgeStyleAct(item.type)">
                    {{ item.type }}
                  </div>
                  <button
                    class="act-unlike"
                    @click="removeActivity('saved', item.id)"
                    title="Retirer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive, watchEffect } from "vue";
import TopBar from "../components/TopBar.vue";
import SidebarStudent from "../components/exploreStudent/Sidebar.vue";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import accountService from "../services/account.service";
import SidebarAdmin from "../components/admin/AdminSidebar.vue";

type SettingsRole = "student" | "teacher" | "professional" | "admin";

const props = withDefaults(
  defineProps<{
    roleVariant?: SettingsRole;
    accountOnly?: boolean;
  }>(),
  {
    roleVariant: "student",
    accountOnly: false,
  },
);

// ── Layout ───────────────────────────────────────────────────────────────────
const sidebarOpen = ref(true);
const currentUser = reactive({
  name: "Nom Prenom",
  email: "exemple.exemple@univ.etu.ac.ma",
  avatar: "",
});
const settingsRole = computed(() => props.roleVariant);
const isAccountOnly = computed(() => props.accountOnly);
const pageDescription = computed(() =>
  isAccountOnly.value
    ? "Gérez l'adresse e-mail et le mot de passe de votre compte."
    : "Gérez votre compte et votre activité sur la plateforme.",
);

// ── Tabs ─────────────────────────────────────────────────────────────────────
const activeTab = ref<"account" | "activity">("account");

const accountTab = {
  value: "account" as const,
  label: "Compte",
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
};

const activityTab = {
  value: "activity" as const,
  label: "Activité",
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
};

const tabs = computed(() =>
  isAccountOnly.value ? [accountTab] : [accountTab, activityTab],
);

watchEffect(() => {
  if (isAccountOnly.value && activeTab.value !== "account") {
    activeTab.value = "account";
  }
});

// ── Email ─────────────────────────────────────────────────────────────────────
const showEmailForm = ref(false);
const emailError = ref("");
const emailSuccess = ref("");
const emailForm = reactive({ newEmail: "", confirmEmail: "", password: "" });

async function loadAccount() {
  try {
    const account = await accountService.getMe();
    currentUser.name =
      account.name ||
      [account.prenom, account.nom].filter(Boolean).join(" ").trim() ||
      currentUser.name;
    currentUser.email = account.email || currentUser.email;
  } catch {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      currentUser.name =
        storedUser.name ||
        [storedUser.prenom, storedUser.nom].filter(Boolean).join(" ").trim() ||
        currentUser.name;
      currentUser.email = storedUser.email || currentUser.email;
    } catch {
      // keep defaults
    }
  }
}

async function saveEmail() {
  emailError.value = "";
  emailSuccess.value = "";
  if (!emailForm.newEmail || !emailForm.confirmEmail || !emailForm.password) {
    emailError.value = "Veuillez remplir tous les champs.";
    return;
  }
  if (emailForm.newEmail !== emailForm.confirmEmail) {
    emailError.value = "Les adresses e-mail ne correspondent pas.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
    emailError.value = "Adresse e-mail invalide.";
    return;
  }
  try {
    const response = await accountService.updateEmail({
      newEmail: emailForm.newEmail,
      currentPassword: emailForm.password,
    });
    currentUser.email = response.data.email;
    emailSuccess.value =
      response.message || "Adresse e-mail mise a jour avec succes.";
    Object.assign(emailForm, { newEmail: "", confirmEmail: "", password: "" });
    setTimeout(() => {
      showEmailForm.value = false;
      emailSuccess.value = "";
    }, 2000);
  } catch (error: any) {
    emailError.value =
      error?.response?.data?.message ||
      "Impossible de mettre a jour l'adresse e-mail.";
  }
}

function cancelEmail() {
  showEmailForm.value = false;
  emailError.value = "";
  emailSuccess.value = "";
  Object.assign(emailForm, { newEmail: "", confirmEmail: "", password: "" });
}

// ── Password ──────────────────────────────────────────────────────────────────
const showPasswordForm = ref(false);
const passwordError = ref("");
const passwordSuccess = ref("");
const showCurrent = ref(false);
const showNew = ref(false);
const passwordForm = reactive({ current: "", newPass: "", confirm: "" });

const strength = computed<{ pct: number; color: string; label: string }>(() => {
  const p = passwordForm.newPass;
  if (!p) return { pct: 0, color: "#e5e7eb", label: "" };
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const levels: { pct: number; color: string; label: string }[] = [
    { pct: 25, color: "#dc2626", label: "Très faible" },
    { pct: 50, color: "#d85a30", label: "Faible" },
    { pct: 75, color: "#ba7517", label: "Moyen" },
    { pct: 100, color: "#0f9e74", label: "Fort" },
  ];
  return (
    levels[score - 1] ?? { pct: 25, color: "#dc2626", label: "Très faible" }
  );
});

async function savePassword() {
  passwordError.value = "";
  passwordSuccess.value = "";
  if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
    passwordError.value = "Veuillez remplir tous les champs.";
    return;
  }
  if (passwordForm.newPass.length < 8) {
    passwordError.value =
      "Le mot de passe doit contenir au moins 8 caracteres.";
    return;
  }
  if (passwordForm.newPass !== passwordForm.confirm) {
    passwordError.value = "Les mots de passe ne correspondent pas.";
    return;
  }
  try {
    const response = await accountService.updatePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.newPass,
      confirmPassword: passwordForm.confirm,
    });
    passwordSuccess.value =
      response.message || "Mot de passe mis a jour avec succes.";
    Object.assign(passwordForm, { current: "", newPass: "", confirm: "" });
    setTimeout(() => {
      showPasswordForm.value = false;
      passwordSuccess.value = "";
    }, 2000);
  } catch (error: any) {
    passwordError.value =
      error?.response?.data?.message ||
      "Impossible de mettre a jour le mot de passe.";
  }
}

function cancelPassword() {
  showPasswordForm.value = false;
  passwordError.value = "";
  passwordSuccess.value = "";
  Object.assign(passwordForm, { current: "", newPass: "", confirm: "" });
}

// ── Activity ──────────────────────────────────────────────────────────────────
type ActivityKey = "liked" | "commented" | "saved";
const activeActivityTab = ref<ActivityKey>("liked");

const activityTabs: { value: ActivityKey; label: string; icon: string }[] = [
  {
    value: "liked",
    label: "Aimés",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  },
  {
    value: "commented",
    label: "Commentés",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
  },
  {
    value: "saved",
    label: "Enregistrés",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>`,
  },
];

interface ActivityItem {
  id: number;
  title: string;
  author: string;
  date: string;
  type: string;
  color: string;
  icon: string;
  comment?: string;
}

// ← Trois refs séparés au lieu d'un Record — élimine le noUncheckedIndexedAccess
const likedItems = ref<ActivityItem[]>([
  {
    id: 1,
    title: "Projet IA — Détection de fraude",
    author: "Sara El Amrani",
    date: "12 mai 2025",
    type: "Projet",
    color: "#ede9fe",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#5b4fcf"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
  },
  {
    id: 2,
    title: "Stage développeur fullstack — Tanger",
    author: "TechMaroc SA",
    date: "3 mai 2025",
    type: "Stage",
    color: "#e1f5ee",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#0f9e74"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  },
  {
    id: 3,
    title: "Certification Vue.js avancé",
    author: "Yassine Benali",
    date: "28 avr. 2025",
    type: "Certification",
    color: "#faeeda",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ba7517"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
  },
]);

const commentedItems = ref<ActivityItem[]>([
  {
    id: 1,
    title: "Projet PheraCore Platform",
    author: "Ferdaous",
    date: "10 mai 2025",
    type: "Projet",
    color: "#ede9fe",
    comment: "Très beau projet, félicitations à toute l'équipe !",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#5b4fcf"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
  },
  {
    id: 2,
    title: "Portfolio — Yassine Benali",
    author: "Yassine Benali",
    date: "2 mai 2025",
    type: "Portfolio",
    color: "#e6f1fb",
    comment: "Design très soigné et bien structuré.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#185fa5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  },
]);

const savedItems = ref<ActivityItem[]>([
  {
    id: 1,
    title: "Guide Docker pour débutants",
    author: "TechAcademy Maroc",
    date: "15 mai 2025",
    type: "Ressource",
    color: "#faeeda",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ba7517"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
  },
  {
    id: 2,
    title: "Stage data analyst — Casablanca",
    author: "DataCorp Maroc",
    date: "8 mai 2025",
    type: "Stage",
    color: "#e1f5ee",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#0f9e74"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  },
  {
    id: 3,
    title: "Algorithme de Dijkstra — Notes de cours",
    author: "M. Ghailani",
    date: "1 avr. 2025",
    type: "Cours",
    color: "#faece7",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d85a30"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
  },
]);

// ← Fonction helper pour les compteurs dans les tabs — sans accès indexé
function getActivityList(key: ActivityKey): ActivityItem[] {
  if (key === "liked") return likedItems.value;
  if (key === "commented") return commentedItems.value;
  return savedItems.value;
}

// ← removeActivity utilise les refs directement — sans accès indexé
function removeActivity(key: ActivityKey, id: number) {
  if (key === "liked") {
    likedItems.value = likedItems.value.filter((i) => i.id !== id);
  } else if (key === "commented") {
    commentedItems.value = commentedItems.value.filter((i) => i.id !== id);
  } else {
    savedItems.value = savedItems.value.filter((i) => i.id !== id);
  }
}

// ── Badge colors ──────────────────────────────────────────────────────────────
const actTypeColors: Record<string, { bg: string; color: string }> = {
  Projet: { bg: "#ede9fe", color: "#5b4fcf" },
  Stage: { bg: "#e1f5ee", color: "#0f9e74" },
  Certification: { bg: "#faeeda", color: "#ba7517" },
  Portfolio: { bg: "#e6f1fb", color: "#185fa5" },
  Ressource: { bg: "#faeeda", color: "#ba7517" },
  Cours: { bg: "#faece7", color: "#d85a30" },
};

function badgeStyleAct(type: string): { background: string; color: string } {
  const s = actTypeColors[type];
  if (!s) return { background: "#f3f4f6", color: "#6b7280" };
  return { background: s.bg, color: s.color };
}

onMounted(loadAccount);
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-top: 60px;
}
.body-area {
  position: relative;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  overflow-x: hidden;
}
.content {
  width: 100%;
  min-width: 0;
  padding: 24px 26px;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  transition: padding-left 0.3s ease;
}
.content.shifted {
  padding-left: 246px;
}

.content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  bottom: 24px;
  background: white;
  border-radius: 8px;
  z-index: 0;
  box-shadow:
    0 2px 8px rgba(17, 24, 39, 0.06),
    0 0 0 1px rgba(17, 24, 39, 0.03);
}

.content.shifted::before {
  left: 230px;
}

.content > * {
  position: relative;
  z-index: 1;
}

.page-head {
  margin-bottom: 24px;
}
.page-head h1 {
  font-family: var(--font-head);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
}
.page-head p {
  font-size: 0.9rem;
  color: var(--text-dark);
}

.settings-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: start;
}

.settings-nav {
  background: white;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: transparent;
  border: none;
  border-left: 3px solid transparent;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.nav-item:hover {
  background: #f9fafb;
  color: var(--text-dark);
}
.nav-item.active {
  border-left-color: var(--purple);
  background: #f5f3ff;
  color: var(--purple);
  font-weight: 600;
}
.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.panel-title {
  font-family: var(--font-head);
  font-size: 1.1rem;
  color: var(--text-dark);
  margin-bottom: 16px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px 24px;
  transition: box-shadow 0.2s ease;
}
.settings-card:hover {
  box-shadow: 0 6px 20px rgba(91, 63, 212, 0.12);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 4px;
}
.card-action {
  margin-left: auto;
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.email-icon {
  background: #e6f1fb;
  color: #185fa5;
}
.lock-icon {
  background: #ede9fe;
  color: #5b4fcf;
}

.card-head h3 {
  font-family: var(--font-head);
  font-size: 0.95rem;
  color: var(--text-dark);
  margin-bottom: 2px;
}
.current-value {
  font-size: 0.83rem;
  color: #9ca3af;
}

.inline-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
  margin-top: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-dark);
}
.form-field input {
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.88rem;
  color: var(--text-dark);
  font-family: var(--font-body);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s;
}
.form-field input:focus {
  border-color: var(--purple);
  background: white;
}

.input-eye {
  position: relative;
}
.input-eye input {
  width: 100%;
  padding-right: 44px;
}
.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
}

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 6px;
}
.strength-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.3s,
    background 0.3s;
}
.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 3px;
  display: block;
}

.form-error {
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.84rem;
}
.form-success {
  background: #ecfdf5;
  color: #065f46;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.84rem;
}
.form-actions {
  display: flex;
  gap: 10px;
}

.btn-save {
  background: var(--purple);
  color: white;
  border: none;
  padding: 0 22px;
  height: 40px;
  border-radius: 10px;
  font-family: var(--font-head);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-save:hover {
  background: #4c3db5;
}
.btn-outline {
  background: white;
  color: var(--purple);
  border: 1.5px solid var(--purple);
  padding: 0 18px;
  height: 36px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-outline:hover {
  background: #f5f3ff;
}
.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0 18px;
  height: 40px;
  border-radius: 10px;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-secondary:hover {
  background: #e5e7eb;
}

.activity-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.act-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  height: 38px;
  border-radius: 999px;
  background: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-size: 0.84rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.act-tab.active {
  box-shadow: 0 2px 8px rgba(91, 63, 212, 0.2);
  color: var(--purple);
  background: #f0eeff;
}
.act-count {
  background: #f0f2f8;
  color: #9ca3af;
  font-size: 0.75rem;
  padding: 1px 7px;
  border-radius: 999px;
}
.act-tab.active .act-count {
  background: #ddd6fe;
  color: var(--purple);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  transition: box-shadow 0.2s ease;
}
.activity-item:hover {
  box-shadow: 0 6px 20px rgba(91, 79, 207, 0.12);
}
.act-thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.act-info {
  flex: 1;
  min-width: 0;
}
.act-title {
  font-family: var(--font-head);
  font-size: 0.9rem;
  color: var(--text-dark);
  font-weight: 600;
}
.act-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 2px;
}
.act-comment-text {
  font-size: 0.82rem;
  color: #6b7280;
  font-style: italic;
  margin: 3px 0;
}
.act-type-badge {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  flex-shrink: 0;
}
.act-unlike {
  background: #fef2f2;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.act-unlike:hover {
  background: #fee2e2;
}
.act-empty {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
  font-size: 0.9rem;
  background: white;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

@media (max-width: 900px) {
  .content,
  .content.shifted {
    padding: 16px;
  }
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .settings-nav {
    display: flex;
    overflow-x: auto;
  }
  .nav-item {
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  .nav-item.active {
    border-left-color: transparent;
    border-bottom-color: var(--purple);
  }
}
</style>
