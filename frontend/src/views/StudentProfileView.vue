<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SidebarStudent
        v-if="userRole === 'student'"
        :isOpen="sidebarOpen"
        :force-navigation="true"
      />
      <SidebarProf
        v-else-if="userRole === 'teacher'"
        :isOpen="sidebarOpen"
        :force-navigation="true"
      />
      <SidebarPro
        v-else
        :isOpen="sidebarOpen"
        :force-navigation="true"
      />

      <main class="content" :class="{ shifted: sidebarOpen }">

        <!-- État chargement / erreur -->
        <div v-if="profileLoading" class="page-state">
          Chargement du profil...
        </div>

        <div v-else-if="profileError" class="page-state page-state--error">
          {{ profileError }}
        </div>

        <template v-else>
          <StudentProfileHeader
            :profile="profile"
            :recent-recommendations="recommendations"
            v-model="activeTab"
            :is-owner="isOwnProfile"
            :connection-label="connectionTabLabel"
            :recommendation-label="recommendationTabLabel"
            :profile-role="viewedProfileRole"
            :tabs="profileHeaderTabs"
            :show-recommendations-summary="showRecommendationsSummary"
            @open-recos="showRecosModal = true"
            @open-portfolio="openPortfolio"
            @avatar-selected="uploadProfileAvatar"
            @banner-selected="uploadProfileBanner"
          />

          <p v-if="profileSuccess" class="profile-feedback profile-feedback--success">
            {{ profileSuccess }}
          </p>
          <p v-if="profileSaveError" class="profile-feedback profile-feedback--error">
            {{ profileSaveError }}
          </p>

          <section v-if="activeTab === 'Connecter'" class="profile-top-popup">
            <div class="connect-card connect-card--top">
              <div>
                <h3>{{ connectionPanelTitle }}</h3>
                <p>{{ connectionPanelDescription }}</p>
                <p v-if="connectionActionMessage" class="connection-message">
                  {{ connectionActionMessage }}
                </p>
              </div>
              <div class="connection-actions">
                <template v-if="connectionStatus.isConnected">
                  <button type="button" class="connect-btn connected" disabled>Déjà connecté</button>
                  <button type="button" class="connect-btn danger" :disabled="connectionLoading" @click="removeConnection">
                    {{ connectionLoading ? 'Traitement...' : 'Supprimer' }}
                  </button>
                </template>
                <template v-else-if="connectionStatus.requestSent">
                  <button type="button" class="connect-btn pending" disabled>Demande envoyée</button>
                  <button type="button" class="connect-btn danger" :disabled="connectionLoading" @click="cancelConnectionRequest">
                    {{ connectionLoading ? 'Traitement...' : 'Annuler' }}
                  </button>
                </template>
                <template v-else-if="connectionStatus.requestReceived">
                  <button type="button" class="connect-btn" :disabled="connectionLoading" @click="acceptConnectionRequest">Accepter</button>
                  <button type="button" class="connect-btn danger" :disabled="connectionLoading" @click="rejectConnectionRequest">Refuser</button>
                </template>
                <button
                  v-else
                  type="button"
                  class="connect-btn"
                  :disabled="connectionLoading || isOwnProfile"
                  @click="sendConnectionRequest"
                >
                  {{ connectionLoading ? 'Traitement...' : 'Se connecter' }}
                </button>
              </div>
            </div>
          </section>

          <!-- Action enseignant : attacher l'étudiant -->
          <section v-if="canAttachStudent" class="teacher-actions">
            <div class="teacher-actions__content">
              <div>
                <h3>Ajouter cet étudiant</h3>
                <p>Ajoutez cet étudiant à votre liste pour pouvoir valider ses demandes.</p>
              </div>
              <button
                type="button"
                class="attach-btn"
                :disabled="attachingStudent || studentAttached"
                @click="attachCurrentStudent"
              >
                {{
                  attachingStudent
                    ? 'Ajout...'
                    : studentAttached
                      ? 'Déjà ajouté'
                      : 'Ajouter à mes étudiants'
                }}
              </button>
            </div>
            <p v-if="attachMessage" class="teacher-actions__message">{{ attachMessage }}</p>
          </section>

          <!-- Tab : Portfolio -->
          <div
            v-if="activeTab === 'Portfolio' && isStudentProfile"
            class="portfolio-tab"
          >
            <section v-if="showRoleOverview" class="role-overview">
              <article
                v-for="item in roleOverviewCards"
                :key="item.label"
                class="role-overview-card"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </section>

            <section v-if="canPublishPosts" class="post-composer">
              <div class="post-composer__head">
                <div>
                  <h3>Publier un post</h3>
                  <p>Partagez une actualité, une expertise ou une opportunité avec votre réseau.</p>
                </div>
                <span class="post-composer__badge">{{ viewedProfileLabel }}</span>
              </div>
              <textarea
                v-model="newPostForm.content"
                class="bio-textarea"
                placeholder="Écrivez votre publication..."
              />
              <div v-if="newPostForm.imagePreview" class="composer-preview">
                <img :src="newPostForm.imagePreview" alt="Aperçu du post" />
                <button type="button" class="remove-photo-btn" @click="clearNewPostImage">
                  Supprimer l'image
                </button>
              </div>
              <div class="post-composer__actions">
                <label class="btn-modifier post-upload-btn" for="new-post-image">
                  Ajouter une image
                </label>
                <input
                  id="new-post-image"
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="onNewPostImageChange"
                />
                <button
                  type="button"
                  class="send-btn"
                  :disabled="postSubmitting || !newPostForm.content.trim()"
                  @click="submitNewPost"
                >
                  {{ postSubmitting ? 'Publication...' : 'Publier' }}
                </button>
              </div>
              <p v-if="postFeedback" class="profile-feedback profile-feedback--success">{{ postFeedback }}</p>
              <p v-if="postError" class="profile-feedback profile-feedback--error">{{ postError }}</p>
            </section>

            <div v-if="!posts.length" class="page-state">
              Aucune publication pour le moment.
            </div>
            <PostCard
              v-for="(post, i) in posts"
              :key="post.id || i"
              :post="post"
              :manageable="isOwnProfile"
              @comment="handleComment(i)"
              @edit="openEditPost"
              @delete="deletePost"
              @like="handleLike(post, $event)"
              @share="handleRepost(post, $event)"
              @submit-comment="handleSubmitComment(post, $event)"
            />
          </div>

          <section v-if="showRolePostsSection" class="portfolio-tab">
            <section v-if="showRoleOverview && !isOwnProfile" class="role-overview">
              <article
                v-for="item in roleOverviewCards"
                :key="item.label"
                class="role-overview-card"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </section>

            <section v-if="canPublishPosts" class="post-composer">
              <div class="post-composer__head">
                <div>
                  <h3>Publier un post</h3>
                  <p>Partagez une actualite, une expertise ou une opportunite avec votre reseau.</p>
                </div>
                <span class="post-composer__badge">{{ viewedProfileLabel }}</span>
              </div>
              <textarea
                v-model="newPostForm.content"
                class="bio-textarea"
                placeholder="Ecrivez votre publication..."
              />
              <div v-if="newPostForm.imagePreview" class="composer-preview">
                <img :src="newPostForm.imagePreview" alt="Apercu du post" />
                <button type="button" class="remove-photo-btn" @click="clearNewPostImage">
                  Supprimer l'image
                </button>
              </div>
              <div class="post-composer__actions">
                <label class="btn-modifier post-upload-btn" for="role-post-image">
                  Ajouter une image
                </label>
                <input
                  id="role-post-image"
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="onNewPostImageChange"
                />
                <button
                  type="button"
                  class="send-btn"
                  :disabled="postSubmitting || !newPostForm.content.trim()"
                  @click="submitNewPost"
                >
                  {{ postSubmitting ? 'Publication...' : 'Publier' }}
                </button>
              </div>
              <p v-if="postFeedback" class="profile-feedback profile-feedback--success">{{ postFeedback }}</p>
              <p v-if="postError" class="profile-feedback profile-feedback--error">{{ postError }}</p>
            </section>

            <div v-if="!posts.length" class="page-state">
              Aucune publication pour le moment.
            </div>
            <PostCard
              v-for="(post, i) in posts"
              :key="`role-post-${post.id || i}`"
              :post="post"
              :manageable="isOwnProfile"
              @comment="handleComment(i)"
              @edit="openEditPost"
              @delete="deletePost"
              @like="handleLike(post, $event)"
              @share="handleRepost(post, $event)"
              @submit-comment="handleSubmitComment(post, $event)"
            />
          </section>

          <!-- Tab : Modifier info (professeur / professionnel) -->
          <section
            v-if="activeTab === 'Modifier info' && !isStudentProfile"
            class="profile-edit-sections"
          >
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>A propos</h3>
                <button v-if="!editingAbout" type="button" class="btn-modifier" @click="openEditAbout">
                  Modifier
                </button>
              </div>
              <template v-if="!editingAbout">
                <p class="pedit-bio-text">{{ profile.bio || 'Aucune biographie renseignee.' }}</p>
              </template>
              <template v-else>
                <textarea v-model="bioForm" class="bio-textarea" placeholder="Decrivez votre parcours et votre expertise..." />
                <div class="pedit-row-actions">
                  <button type="button" class="send-btn" :disabled="savingProfile" @click="saveBio">
                    {{ savingProfile ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                  <button type="button" class="cancel-btn" @click="cancelBio">Annuler</button>
                </div>
              </template>
            </div>

            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Contact et liens</h3>
                <button v-if="!editingContact" type="button" class="btn-modifier" @click="openEditContact">
                  Modifier
                </button>
              </div>
              <template v-if="!editingContact">
                <div class="contact-display">
                  <div v-if="profile.email" class="contact-row"><span>{{ profile.email }}</span></div>
                  <div v-if="profile.phone" class="contact-row"><span>{{ profile.phone }}</span></div>
                  <div v-if="profile.website" class="contact-row"><span>{{ profile.website }}</span></div>
                  <div v-if="profile.linkedin" class="contact-row"><span>{{ profile.linkedin }}</span></div>
                  <div v-if="profile.github" class="contact-row"><span>{{ profile.github }}</span></div>
                </div>
              </template>
              <template v-else>
                <div class="contact-form">
                  <div class="form-field"><label>Email</label><input v-model="contactForm.email" type="email" /></div>
                  <div class="form-field"><label>Telephone</label><input v-model="contactForm.phone" type="tel" /></div>
                  <div class="form-field"><label>Site web</label><input v-model="contactForm.website" type="url" /></div>
                  <div class="form-field"><label>LinkedIn</label><input v-model="contactForm.linkedin" type="url" /></div>
                  <div class="form-field"><label>GitHub</label><input v-model="contactForm.github" type="url" /></div>
                </div>
                <div class="pedit-row-actions">
                  <button type="button" class="send-btn" :disabled="savingProfile" @click="saveContact">
                    {{ savingProfile ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                  <button type="button" class="cancel-btn" @click="editingContact = false">Annuler</button>
                </div>
              </template>
            </div>

            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Informations {{ viewedProfileLabel.toLowerCase() }}</h3>
              </div>
              <div class="role-overview role-overview--edit">
                <article
                  v-for="item in roleOverviewCards"
                  :key="item.label"
                  class="role-overview-card"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>
            </div>
          </section>

          <!-- Tab : Modifier bio (profil etudiant) -->
          <section v-if="activeTab === 'Modifier bio' && isStudentProfile" class="profile-edit-sections">

            <!-- À propos -->
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>À propos</h3>
                <button v-if="!editingAbout" type="button" class="btn-modifier" @click="openEditAbout">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
              </div>
              <template v-if="!editingAbout">
                <p class="pedit-bio-text">{{ profile.bio || 'Aucune biographie renseignée.' }}</p>
              </template>
              <template v-else>
                <textarea v-model="bioForm" class="bio-textarea" placeholder="Décrivez-vous en quelques mots..." />
                <div class="pedit-row-actions">
                  <button type="button" class="send-btn" :disabled="savingProfile" @click="saveBio">
                    {{ savingProfile ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                  <button type="button" class="cancel-btn" @click="cancelBio">Annuler</button>
                </div>
              </template>
            </div>

            <!-- Contact et liens -->
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Contact et liens</h3>
                <button v-if="!editingContact" type="button" class="btn-modifier" @click="openEditContact">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
              </div>
              <template v-if="!editingContact">
                <div class="contact-display">
                  <div v-if="profile.email" class="contact-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{{ profile.email }}</span>
                  </div>
                  <div v-if="profile.phone" class="contact-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56A16 16 0 0 0 16 16.59l.84-.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>{{ profile.phone }}</span>
                  </div>
                  <div v-if="profile.website" class="contact-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    <span>{{ profile.website }}</span>
                  </div>
                  <div v-if="profile.linkedin" class="contact-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    <span class="contact-link linkedin-color">LinkedIn</span>
                  </div>
                  <div v-if="profile.github" class="contact-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                    <span>GitHub</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="contact-form">
                  <div class="form-field"><label>Email</label><input v-model="contactForm.email" type="email" placeholder="exemple@univ.ac.ma" /></div>
                  <div class="form-field"><label>Téléphone</label><input v-model="contactForm.phone" type="tel" placeholder="+212 6 00 00 00 00" /></div>
                  <div class="form-field"><label>Site web</label><input v-model="contactForm.website" type="url" placeholder="https://portfolio.example.com" /></div>
                  <div class="form-field"><label>LinkedIn</label><input v-model="contactForm.linkedin" type="url" placeholder="https://linkedin.com/in/..." /></div>
                  <div class="form-field"><label>GitHub</label><input v-model="contactForm.github" type="url" placeholder="https://github.com/..." /></div>
                </div>
                <div class="pedit-row-actions">
                  <button type="button" class="send-btn" :disabled="savingProfile" @click="saveContact">
                    {{ savingProfile ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                  <button type="button" class="cancel-btn" @click="editingContact = false">Annuler</button>
                </div>
              </template>
            </div>

            <!-- Compétences -->
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Compétences</h3>
                <button v-if="!editingSkills && isStudentProfile" type="button" class="btn-modifier" @click="openEditSkills">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modifier
                </button>
              </div>
              <template v-if="!editingSkills">
                <div v-if="technicalSkillNames.length" class="skills-group">
                  <p class="skills-label">Techniques</p>
                  <div class="skills-chips">
                    <span v-for="s in technicalSkillNames" :key="s" class="skill-chip tech">{{ s }}</span>
                  </div>
                </div>
                <div v-if="softSkillNames.length" class="skills-group">
                  <p class="skills-label">Comportementales</p>
                  <div class="skills-chips">
                    <span v-for="s in softSkillNames" :key="s" class="skill-chip soft">{{ s }}</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="skills-edit-group">
                  <p class="skills-label">Techniques</p>
                  <div class="skills-chips editable">
                    <span v-for="(s, i) in skillForms.tech" :key="i" class="skill-chip tech editable">
                      {{ s }}<button type="button" @click="skillForms.tech.splice(i, 1)">×</button>
                    </span>
                  </div>
                  <div class="skill-add-row">
                    <input v-model="skillForms.newTech" placeholder="Ajouter une compétence..." @keyup.enter="addTechSkill" />
                    <button type="button" class="btn-add-skill" @click="addTechSkill">+</button>
                  </div>
                </div>
                <div class="skills-edit-group">
                  <p class="skills-label">Comportementales</p>
                  <div class="skills-chips editable">
                    <span v-for="(s, i) in skillForms.soft" :key="i" class="skill-chip soft editable">
                      {{ s }}<button type="button" @click="skillForms.soft.splice(i, 1)">×</button>
                    </span>
                  </div>
                  <div class="skill-add-row">
                    <input v-model="skillForms.newSoft" placeholder="Ajouter une compétence..." @keyup.enter="addSoftSkill" />
                    <button type="button" class="btn-add-skill" @click="addSoftSkill">+</button>
                  </div>
                </div>
                <div class="pedit-row-actions">
                  <button type="button" class="send-btn" @click="saveSkills">Enregistrer</button>
                  <button type="button" class="cancel-btn" @click="editingSkills = false">Annuler</button>
                </div>
              </template>
            </div>

            <!-- Expériences professionnelles -->
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Expériences professionnelles</h3>
                <button type="button" class="btn-add-entry" @click="openAddEntry('exp')">+ Ajouter</button>
              </div>
              <div v-for="exp in experiences" :key="exp.id" class="entry-item">
                <span class="entry-dot blue" />
                <div class="entry-body">
                  <div class="entry-top">
                    <div>
                      <strong>{{ exp.poste }}</strong>
                      <p class="entry-sub">{{ exp.entreprise }}</p>
                      <p class="entry-date">{{ exp.debut }} — {{ exp.fin }}</p>
                      <p v-if="exp.description" class="entry-desc">{{ exp.description }}</p>
                    </div>
                    <div class="entry-actions">
                      <button type="button" class="icon-btn" @click="openEditEntry('exp', exp.id)" title="Modifier">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button type="button" class="icon-btn delete" @click="deleteEntry('exp', exp.id)" title="Supprimer">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formations -->
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Formations</h3>
                <button type="button" class="btn-add-entry" @click="openAddEntry('form')">+ Ajouter</button>
              </div>
              <div v-for="f in formations" :key="f.id" class="entry-item">
                <span class="entry-dot blue" />
                <div class="entry-body">
                  <div class="entry-top">
                    <div>
                      <strong>{{ f.diplome }}</strong>
                      <p class="entry-sub">{{ f.etablissement }}</p>
                      <p class="entry-date">{{ f.debut }} — {{ f.fin }}</p>
                    </div>
                    <div class="entry-actions">
                      <button type="button" class="icon-btn" @click="openEditEntry('form', f.id)" title="Modifier">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button type="button" class="icon-btn delete" @click="deleteEntry('form', f.id)" title="Supprimer">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Certifications -->
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Certifications</h3>
                <button type="button" class="btn-add-entry" @click="openAddEntry('cert')">+ Ajouter</button>
              </div>
              <div v-for="c in certifications" :key="c.id" class="entry-item">
                <span class="entry-dot green" />
                <div class="entry-body">
                  <div class="entry-top">
                    <div>
                      <strong>{{ c.titre }}</strong>
                      <p class="entry-sub">{{ c.organisme }}</p>
                      <p class="entry-date">{{ c.date }}</p>
                    </div>
                    <div class="entry-actions">
                      <button type="button" class="icon-btn" @click="openEditEntry('cert', c.id)" title="Modifier">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button type="button" class="icon-btn delete" @click="deleteEntry('cert', c.id)" title="Supprimer">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Langues -->
            <div class="pedit-card">
              <div class="pedit-head">
                <h3>Langues</h3>
                <button type="button" class="btn-add-entry" @click="openAddEntry('langue')">+ Ajouter</button>
              </div>
              <div class="langues-grid">
                <div v-for="l in langues" :key="l.id" class="langue-chip">
                  <div class="langue-info">
                    <strong>{{ l.nom }}</strong>
                    <span>{{ l.niveau }}</span>
                  </div>
                  <div class="entry-actions">
                    <button type="button" class="icon-btn" @click="openEditEntry('langue', l.id)" title="Modifier">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button type="button" class="icon-btn delete" @click="deleteEntry('langue', l.id)" title="Supprimer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommandations (lecture seule) -->
            <div class="pedit-card">
              <div class="pedit-head"><h3>Recommandations</h3></div>
              <div class="recommendations-list">
                <article v-for="r in recommendations" :key="r.id" class="recommendation-card">
                  <div class="mini-avatar">
                    <img v-if="r.avatar" :src="r.avatar" alt="" />
                    <span v-else>{{ getInitials(r.author) }}</span>
                  </div>
                  <div class="recommendation-content">
                    <div class="recommendation-head">
                      <div>
                        <h4>{{ r.author }}</h4>
                        <p>{{ r.role === 'teacher' ? 'Professeur' : 'Professionnel' }}</p>
                      </div>
                      <span>{{ r.date }}</span>
                    </div>
                    <p class="recommendation-message">{{ r.message || 'Recommandation sans commentaire.' }}</p>
                  </div>
                </article>
              </div>
            </div>

          </section>

          <section
            v-if="activeTab === 'Demandes' && canOpenProfessorRequests"
            class="requests-panel"
          >
            <article class="pedit-card role-action-card role-action-card--wide">
              <div>
                <h3>Demande de validation de projet</h3>
                <p>Envoyez un projet a {{ profile.name }} pour validation. Le professeur recevra la notification dans son espace de validations.</p>
              </div>
              <div class="contact-form">
                <div class="form-field">
                  <label>Titre du projet</label>
                  <input v-model="projectRequestForm.titre" type="text" placeholder="Ex: Plateforme de gestion des stages" />
                </div>
                <div class="form-field">
                  <label>Lien GitHub</label>
                  <input v-model="projectRequestForm.lien_github" type="url" placeholder="https://github.com/..." />
                </div>
                <div class="form-field">
                  <label>Technologies</label>
                  <input v-model="projectRequestForm.technologies" type="text" placeholder="Vue, Node.js, Docker" />
                </div>
                <div class="form-field">
                  <label>Description</label>
                  <textarea v-model="projectRequestForm.description" rows="4" placeholder="Precisez le contexte, votre role et les resultats attendus..." />
                </div>
              </div>
              <div class="pedit-row-actions">
                <button
                  type="button"
                  class="send-btn"
                  :disabled="projectRequestLoading"
                  @click="submitProjectValidationRequest"
                >
                  {{ projectRequestLoading ? 'Envoi...' : 'Envoyer le projet' }}
                </button>
              </div>
              <p v-if="projectRequestSuccess" class="profile-feedback profile-feedback--success">{{ projectRequestSuccess }}</p>
              <p v-if="projectRequestError" class="profile-feedback profile-feedback--error">{{ projectRequestError }}</p>
            </article>

            <article class="pedit-card role-action-card role-action-card--wide">
              <div>
                <h3>Demande de validation de stage</h3>
                <p>Ajoutez votre stage et transmettez-le directement a ce professeur pour validation.</p>
              </div>
              <div class="contact-form">
                <div class="form-field">
                  <label>Entreprise</label>
                  <input v-model="stageRequestForm.entreprise" type="text" placeholder="Ex: Entreprise Alpha" />
                </div>
                <div class="form-field">
                  <label>Poste</label>
                  <input v-model="stageRequestForm.poste" type="text" placeholder="Ex: Stagiaire developpement web" />
                </div>
                <div class="form-field">
                  <label>Date de debut</label>
                  <input v-model="stageRequestForm.date_debut" type="date" />
                </div>
                <div class="form-field">
                  <label>Date de fin</label>
                  <input v-model="stageRequestForm.date_fin" type="date" />
                </div>
                <div class="form-field">
                  <label>Technologies</label>
                  <input v-model="stageRequestForm.technologies" type="text" placeholder="Laravel, PostgreSQL, React" />
                </div>
                <div class="form-field">
                  <label>Missions</label>
                  <textarea v-model="stageRequestForm.missions" rows="4" placeholder="Resumez les missions du stage..." />
                </div>
              </div>
              <div class="pedit-row-actions">
                <button
                  type="button"
                  class="send-btn"
                  :disabled="stageRequestLoading"
                  @click="submitStageValidationRequest"
                >
                  {{ stageRequestLoading ? 'Envoi...' : 'Envoyer le stage' }}
                </button>
              </div>
              <p v-if="stageRequestSuccess" class="profile-feedback profile-feedback--success">{{ stageRequestSuccess }}</p>
              <p v-if="stageRequestError" class="profile-feedback profile-feedback--error">{{ stageRequestError }}</p>
            </article>

            <article class="pedit-card role-action-card role-action-card--wide">
              <div>
                <h3>Demande de lettre de recommandation</h3>
                <p>Demandez a {{ profile.name }} de rediger une lettre de recommandation.</p>
              </div>
              <div class="contact-form">
                <div class="form-field">
                  <label>Motif</label>
                  <select v-model="letterRequestForm.motif">
                    <option value="MASTER">Master</option>
                    <option value="EMPLOI">Emploi</option>
                    <option value="STAGE">Stage</option>
                    <option value="DOUBLE_DIPLOME">Double diplome</option>
                    <option value="INTERNATIONAL">International</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Date souhaitee</label>
                  <input v-model="letterRequestForm.date_souhaitee" type="date" />
                </div>
              </div>
              <div class="pedit-row-actions">
                <button
                  type="button"
                  class="send-btn"
                  :disabled="letterRequestLoading"
                  @click="submitLetterRequest"
                >
                  {{ letterRequestLoading ? 'Envoi...' : 'Envoyer la demande' }}
                </button>
              </div>
              <p v-if="letterRequestSuccess" class="profile-feedback profile-feedback--success">{{ letterRequestSuccess }}</p>
              <p v-if="letterRequestError" class="profile-feedback profile-feedback--error">{{ letterRequestError }}</p>
            </article>
          </section>

          <!-- Tab : Recommander / Demander -->
          <section
            v-if="activeTab === 'Recommander' && (canSendRecommendation || canRequestLetterValidation)"
            class="connect-tab"
          >
            <div class="share-card role-action-card">
              <div>
                <h3>{{ recommendationTabTitle }}</h3>
                <p>{{ recommendationTabDescription }}</p>
              </div>

              <template v-if="canSendRecommendation">
                <textarea
                  v-model="recommendationMessage"
                  class="bio-textarea"
                  placeholder="Écrivez votre recommandation..."
                />
                <div class="share-actions">
                  <button type="button" class="send-btn" @click="sendRecommendation">
                    Envoyer la recommandation
                  </button>
                </div>
                <p v-if="recommendationFeedback" class="profile-feedback profile-feedback--success">{{ recommendationFeedback }}</p>
                <p v-if="recommendationError" class="profile-feedback profile-feedback--error">{{ recommendationError }}</p>
              </template>

              <template v-else-if="canRequestLetterValidation">
                <div class="contact-form">
                  <div class="form-field">
                    <label>Motif</label>
                    <select v-model="letterRequestForm.motif">
                      <option value="MASTER">Master</option>
                      <option value="EMPLOI">Emploi</option>
                      <option value="STAGE">Stage</option>
                      <option value="DOUBLE_DIPLOME">Double diplôme</option>
                      <option value="INTERNATIONAL">International</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>Date souhaitée</label>
                    <input v-model="letterRequestForm.date_souhaitee" type="date" />
                  </div>
                </div>
                <div class="share-actions">
                  <button
                    type="button"
                    class="send-btn"
                    :disabled="letterRequestLoading"
                    @click="submitLetterRequest"
                  >
                    {{ letterRequestLoading ? 'Envoi...' : 'Envoyer la demande' }}
                  </button>
                </div>
                <p v-if="letterRequestSuccess" class="profile-feedback profile-feedback--success">{{ letterRequestSuccess }}</p>
                <p v-if="letterRequestError" class="profile-feedback profile-feedback--error">{{ letterRequestError }}</p>
              </template>

              <p v-else class="page-state">
                Cette action n'est pas disponible pour ce profil.
              </p>
            </div>
          </section>

          <!-- Tab : Connecter -->
          <section v-if="false" class="connect-tab">
            <div class="connect-card">
              <div>
                <h3>{{ connectionPanelTitle }}</h3>
                <p>{{ connectionPanelDescription }}</p>
                <p v-if="connectionActionMessage" class="connection-message">
                  {{ connectionActionMessage }}
                </p>
              </div>
              <div class="connection-actions">
                <template v-if="connectionStatus.isConnected">
                  <button type="button" class="connect-btn connected" disabled>Déjà connecté</button>
                  <button type="button" class="connect-btn danger" :disabled="connectionLoading" @click="removeConnection">
                    Retirer la connexion
                  </button>
                </template>
                <template v-else-if="connectionStatus.requestSent">
                  <button type="button" class="connect-btn pending" disabled>Demande envoyée</button>
                  <button type="button" class="connect-btn danger" :disabled="connectionLoading" @click="cancelConnectionRequest">
                    Annuler la demande
                  </button>
                </template>
                <template v-else-if="connectionStatus.requestReceived">
                  <button type="button" class="connect-btn" :disabled="connectionLoading" @click="acceptConnectionRequest">Accepter</button>
                  <button type="button" class="connect-btn danger" :disabled="connectionLoading" @click="rejectConnectionRequest">Refuser</button>
                </template>
                <button
                  v-else
                  type="button"
                  class="connect-btn"
                  :disabled="connectionLoading || isOwnProfile"
                  @click="sendConnectionRequest"
                >
                  {{ connectionLoading ? 'Traitement...' : 'Se connecter' }}
                </button>
              </div>
            </div>
          </section>

          <!-- Tab : Partager -->
          <section v-if="activeTab === 'Partager'" class="share-tab">
            <div class="share-card">
              <div>
                <h3>Partager ce profil</h3>
                <p>Copiez le lien ou partagez directement avec votre réseau.</p>
              </div>
              <div class="link-box">
                <span>{{ profileUrl }}</span>
                <button type="button" @click="copyProfileLink">
                  {{ copied ? 'Copié' : 'Copier' }}
                </button>
              </div>
              <div class="share-actions">
                <a :href="gmailShareUrl" target="_blank" rel="noopener" class="share-btn gmail">Gmail</a>
                <a :href="linkedinShareUrl" target="_blank" rel="noopener" class="share-btn linkedin">LinkedIn</a>
                <a :href="whatsappShareUrl" target="_blank" rel="noopener" class="share-btn whatsapp">WhatsApp</a>
                <a :href="xShareUrl" target="_blank" rel="noopener" class="share-btn x">X</a>
              </div>
            </div>
          </section>

        </template>
      </main>
    </div>

    <!-- Modal CRUD entrées (exp, form, cert, langue) -->
    <div v-if="activeEntryModal" class="modal-backdrop" @click.self="activeEntryModal = null">
      <div class="entry-modal">
        <div class="modal-head">
          <h3>{{ editingEntryId !== null ? 'Modifier' : 'Ajouter' }} {{ entryModalTitle }}</h3>
          <button type="button" @click="activeEntryModal = null">×</button>
        </div>
        <div class="entry-modal-body">
          <template v-if="activeEntryModal === 'exp'">
            <div class="form-field"><label>Poste</label><input v-model="expForm.poste" placeholder="Développeur Full Stack" /></div>
            <div class="form-field"><label>Entreprise</label><input v-model="expForm.entreprise" placeholder="Nom de l'entreprise" /></div>
            <div class="form-field-row">
              <div class="form-field"><label>Début</label><input v-model="expForm.debut" placeholder="2024-01" /></div>
              <div class="form-field"><label>Fin</label><input v-model="expForm.fin" placeholder="2024-06 ou En cours" /></div>
            </div>
            <div class="form-field"><label>Description</label><textarea v-model="expForm.description" placeholder="Description du poste..." /></div>
          </template>
          <template v-if="activeEntryModal === 'form'">
            <div class="form-field"><label>Diplôme</label><input v-model="formForm.diplome" placeholder="Ingénierie Informatique" /></div>
            <div class="form-field"><label>Établissement</label><input v-model="formForm.etablissement" placeholder="Nom de l'école" /></div>
            <div class="form-field-row">
              <div class="form-field"><label>Début</label><input v-model="formForm.debut" placeholder="2022" /></div>
              <div class="form-field"><label>Fin</label><input v-model="formForm.fin" placeholder="2025" /></div>
            </div>
          </template>
          <template v-if="activeEntryModal === 'cert'">
            <div class="form-field"><label>Titre</label><input v-model="certForm.titre" placeholder="AWS Cloud Practitioner" /></div>
            <div class="form-field"><label>Organisme</label><input v-model="certForm.organisme" placeholder="Amazon Web Services" /></div>
            <div class="form-field"><label>Date</label><input v-model="certForm.date" placeholder="Jan 2025" /></div>
          </template>
          <template v-if="activeEntryModal === 'langue'">
            <div class="form-field"><label>Langue</label><input v-model="langueForm.nom" placeholder="Français" /></div>
            <div class="form-field">
              <label>Niveau</label>
              <select v-model="langueForm.niveau">
                <option>Natif</option>
                <option>Courant</option>
                <option>Professionnel</option>
                <option>Intermédiaire</option>
                <option>Débutant</option>
              </select>
            </div>
          </template>
        </div>
        <div class="entry-modal-footer">
          <button type="button" class="send-btn" @click="saveEntry">Enregistrer</button>
          <button type="button" class="cancel-btn" @click="activeEntryModal = null">Annuler</button>
        </div>
      </div>
    </div>

    <!-- Modal modification post -->
    <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
      <div class="post-edit-modal">
        <div class="modal-head">
          <h3>Modifier le post</h3>
          <button type="button" @click="showEditModal = false">×</button>
        </div>
        <div class="post-edit-body">
          <label class="field-label">Description</label>
          <textarea v-model="editForm.description" class="edit-textarea" placeholder="Description du post..." />
          <label class="field-label">Photo</label>
          <div class="photo-manager">
            <div v-if="editForm.imagePreview" class="current-photo-wrap">
              <img :src="editForm.imagePreview" class="current-photo-img" alt="photo du post" />
              <button type="button" class="remove-photo-btn" @click="editForm.imagePreview = null">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Supprimer la photo
              </button>
            </div>
            <label v-else class="add-photo-label" for="edit-post-img">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Ajouter une photo
              <input id="edit-post-img" type="file" accept="image/*" class="sr-only" @change="onEditImageChange" />
            </label>
          </div>
          <p v-if="editPostError" class="profile-feedback profile-feedback--error">{{ editPostError }}</p>
        </div>
        <div class="post-edit-footer">
          <button type="button" class="send-btn" :disabled="editPostSaving" @click="saveEditPost">
            {{ editPostSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
          <button type="button" class="cancel-btn" @click="showEditModal = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- Modal recommandations -->
    <div
      v-if="showRecosModal && !profileLoading && !profileError"
      class="modal-backdrop"
      @click.self="showRecosModal = false"
    >
      <div class="recos-modal">
        <div class="modal-head">
          <h3>Personnes qui ont recommandé {{ profile.name }}</h3>
          <button type="button" @click="showRecosModal = false">×</button>
        </div>
        <div class="recommenders-list">
          <div v-for="recommendation in recommendations" :key="recommendation.id" class="recommender">
            <div class="mini-avatar">
              <img v-if="recommendation.avatar" :src="recommendation.avatar" alt="" />
              <span v-else>{{ getInitials(recommendation.author) }}</span>
            </div>
            <div>
              <strong>{{ recommendation.author }}</strong>
              <p>{{ recommendation.role === 'teacher' ? 'Professeur' : 'Professionnel' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import TopBar from '../components/TopBar.vue'
import SidebarStudent from '../components/exploreStudent/Sidebar.vue'
import SidebarProf from '../components/exploreProf/SidebarProf.vue'
import SidebarPro from '../components/explorePro/SidebarPro.vue'
import StudentProfileHeader from '../components/StudentProfileHeader.vue'
import PostCard from '../components/PostCard.vue'
import { connexionService } from '../services/connexion.service'
import { lettreService } from '../services/lettre.service'
import { postService } from '../services/post.service'
import { projetService } from '../services/projet.service'
import profApi from '../services/profApi'
import { profileService } from '../services/profile.service'
import { recommendationService } from '../services/recommendation.service'
import { stageService } from '../services/stage.service'

// ─── Types ────────────────────────────────────────────────────────────────────

type Recommendation = {
  id: number
  author: string
  role: 'teacher' | 'professional' | 'student'
  avatar?: string
  message?: string
  date: string
}

type ProfilePost = {
  id?: number
  author: string
  subtitle: string
  description: string
  liked?: boolean
  reposted?: boolean
  avatar?: string
  images?: string[]
  imageUrl?: string
  media?: Array<string | { url: string; type?: 'image' | 'video' | 'pdf' | 'file'; name?: string }>
  comments?: Array<{
    id: number
    author: string
    text: string
    time: string
    avatar?: string
  }>
  likeCount?: number
  commentCount?: number
  repostCount?: number
}

type ConnectionStatus = {
  isConnected: boolean
  requestSent: boolean
  requestReceived: boolean
  status: string
  connexionId: string | null
}

type ProfileRole = 'student' | 'teacher' | 'professional'

interface Experience { id: number; poste: string; entreprise: string; debut: string; fin: string; description: string }
interface Formation { id: number; diplome: string; etablissement: string; debut: string; fin: string }
interface Certification { id: number; titre: string; organisme: string; date: string }
interface Langue { id: number; nom: string; niveau: string }
type EntrySection = 'exp' | 'form' | 'cert' | 'langue'

// ─── Router / Auth ────────────────────────────────────────────────────────────

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// ─── UI state ─────────────────────────────────────────────────────────────────

const sidebarOpen = ref(false)
const showRecosModal = ref(false)
const showEditModal = ref(false)
const copied = ref(false)
const savingProfile = ref(false)
const profileSuccess = ref('')
const profileSaveError = ref('')

// ─── Role ─────────────────────────────────────────────────────────────────────

const normalizedAuthRole = computed<'student' | 'teacher' | 'professional' | null>(() => {
  const storedRole = localStorage.getItem('role')
  const role = String(auth.role || storedRole || '').trim().toUpperCase()
  if (role === 'TEACHER' || role === 'PROFESSEUR') return 'teacher'
  if (role === 'PROFESSIONAL' || role === 'PROFESSIONNEL') return 'professional'
  if (role === 'STUDENT' || role === 'ETUDIANT') return 'student'
  return null
})

const currentUserAvatar = computed(() => resolveBackendAsset(auth.user?.avatar || auth.user?.photo_profil || ''))
const currentUserName = computed(() =>
  [auth.user?.prenom, auth.user?.nom].filter(Boolean).join(' ').trim() ||
  auth.user?.name ||
  'Vous'
)

const roleFromRoute = computed<'student' | 'teacher' | 'professional' | null>(() => {
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  if (from === 'prof') return 'teacher'
  if (from === 'pro') return 'professional'
  if (from === 'student') return 'student'
  return null
})

const userRole = computed<'student' | 'teacher' | 'professional'>(
  () => normalizedAuthRole.value ?? roleFromRoute.value ?? 'student'
)

// ─── Tab ──────────────────────────────────────────────────────────────────────

const allowedTabs = new Set(['Portfolio', 'Recommander', 'Demandes', 'Connecter', 'Compétances', 'À propos', 'Partager', 'Modifier bio', 'Modifier info'])

const getRouteTab = () => {
  const rawTab = typeof route.query.tab === 'string' ? route.query.tab : 'Portfolio'
  const tab = rawTab === 'Modifier bio' && normalizedAuthRole.value !== 'student'
    ? 'Modifier info'
    : rawTab
  return allowedTabs.has(tab) ? tab : 'Portfolio'
}

const activeTab = ref(getRouteTab())

function resolveDefaultTab() {
  if (isOwnProfile.value) return isStudentProfile.value ? getRouteTab() : 'Portfolio'
  if (isTeacherProfile.value) return canOpenProfessorRequests.value ? 'Demandes' : canRequestLetterValidation.value ? 'Recommander' : 'À propos'
  if (isProfessionalProfile.value) return 'À propos'
  return getRouteTab()
}

// ─── Profile data ─────────────────────────────────────────────────────────────

const profileLoading = ref(true)
const profileError = ref('')
const profileRaw = ref<any>(null)
const viewedProfileRole = ref<ProfileRole>('student')

const profile = ref({
  id: 0,
  name: '',
  score: 0,
  title: '',
  school: '',
  location: '',
  recos: '0',
  avatar: '',
  banner: '',
  bio: '',
  email: '',
  phone: '',
  website: '',
  linkedin: '',
  github: '',
  technicalSkills: [] as Array<{ name: string; level: number; description: string; projectsCount: number }>,
  softSkills: [] as Array<{ name: string; level: number; description: string; projectsCount: number }>
})

const recommendations = ref<Recommendation[]>([])
const posts = ref<ProfilePost[]>([])
const recommendationFeedback = ref('')
const recommendationError = ref('')

const isStudentProfile = computed(() => viewedProfileRole.value === 'student')
const isTeacherProfile = computed(() => viewedProfileRole.value === 'teacher')
const isProfessionalProfile = computed(() => viewedProfileRole.value === 'professional')
const canAttachStudent = computed(() => userRole.value === 'teacher' && isStudentProfile.value && !isOwnProfile.value)
const canPublishPosts = computed(() => isOwnProfile.value && (isTeacherProfile.value || isProfessionalProfile.value))
const canSendRecommendation = computed(
  () => !isOwnProfile.value && isStudentProfile.value && (userRole.value === 'teacher' || userRole.value === 'professional')
)
const canRequestLetterValidation = computed(
  () => !isOwnProfile.value && userRole.value === 'student' && isTeacherProfile.value
)
const canOpenProfessorRequests = computed(
  () => !isOwnProfile.value && userRole.value === 'student' && isTeacherProfile.value
)
const showRoleOverview = computed(() => isTeacherProfile.value || isProfessionalProfile.value)
const viewedProfileLabel = computed(() => {
  if (isTeacherProfile.value) return 'Professeur'
  if (isProfessionalProfile.value) return 'Professionnel'
  return 'Etudiant'
})
const roleOverviewCards = computed(() => {
  const rawProfessor = profileRaw.value?.professeur || {}
  const rawProfessional = profileRaw.value?.professionnel || {}

  if (isTeacherProfile.value) {
    return [
      { label: 'Specialite', value: rawProfessor.specialite || profile.value.title || 'Non renseignee' },
      { label: 'Etablissement', value: rawProfessor.etablissement || profile.value.school || 'Non renseigne' },
      { label: 'Localisation', value: profile.value.location || 'Non renseignee' },
    ]
  }

  if (isProfessionalProfile.value) {
    return [
      { label: 'Poste', value: rawProfessional.poste || profile.value.title || 'Non renseigne' },
      { label: 'Entreprise', value: rawProfessional.entreprise || profile.value.school || 'Non renseignee' },
      { label: 'Secteur', value: rawProfessional.secteur || 'Non renseigne' },
    ]
  }

  return []
})
const showRolePostsSection = computed(() => {
  if (isStudentProfile.value) return false
  if (isOwnProfile.value) return activeTab.value !== 'Modifier info'
  return activeTab.value === 'À propos'
})
const profileHeaderTabs = computed(() => {
  if (isOwnProfile.value) return undefined
  if (isTeacherProfile.value) return ['Demandes', 'Connecter', 'À propos', 'Partager']
  if (isProfessionalProfile.value) return ['Connecter', 'À propos', 'Partager']
  return undefined
})
const showRecommendationsSummary = computed(
  () => isStudentProfile.value
)

// Derived skill name lists (used in display mode)
const technicalSkillNames = computed(() => profile.value.technicalSkills.map(s => s.name))
const softSkillNames = computed(() => profile.value.softSkills.map(s => s.name))

// ─── Teacher attach ───────────────────────────────────────────────────────────

const attachingStudent = ref(false)
const studentAttached = ref(false)
const attachMessage = ref('')
const postSubmitting = ref(false)
const postFeedback = ref('')
const postError = ref('')
const projectRequestLoading = ref(false)
const projectRequestSuccess = ref('')
const projectRequestError = ref('')
const stageRequestLoading = ref(false)
const stageRequestSuccess = ref('')
const stageRequestError = ref('')
const letterRequestLoading = ref(false)
const letterRequestSuccess = ref('')
const letterRequestError = ref('')
const newPostForm = reactive({
  content: '',
  imageFile: null as File | null,
  imagePreview: '',
})
const projectRequestForm = reactive({
  titre: '',
  description: '',
  technologies: '',
  lien_github: '',
})
const stageRequestForm = reactive({
  entreprise: '',
  poste: '',
  missions: '',
  technologies: '',
  date_debut: '',
  date_fin: '',
})
const letterRequestForm = reactive({
  motif: 'MASTER',
  date_souhaitee: '',
})

// ─── IDs ──────────────────────────────────────────────────────────────────────

const profileStudentId = computed<number | undefined>(() => {
  const id = Number(route.params.id)
  return !isNaN(id) && id > 0 ? id : undefined
})

const profileId = computed(() => profileStudentId.value || profile.value.id)

const currentUserId = computed(() => {
  const rawUser = localStorage.getItem('user')
  if (!rawUser) return null
  try {
    const parsed = JSON.parse(rawUser)
    const id = parsed?.id_utilisateur ?? parsed?.id
    return id == null ? null : Number(id)
  } catch {
    return null
  }
})

const isOwnProfile = computed(() =>
  Boolean(currentUserId.value && profileId.value && Number(currentUserId.value) === Number(profileId.value))
)

// ─── Connection ───────────────────────────────────────────────────────────────

const defaultConnectionStatus = (): ConnectionStatus => ({
  isConnected: false,
  requestSent: false,
  requestReceived: false,
  status: 'NONE',
  connexionId: null
})

const connectionStatus = ref<ConnectionStatus>(defaultConnectionStatus())
const connectionLoading = ref(false)
const connectionActionMessage = ref('')

const connectionTabLabel = computed(() => {
  if (isOwnProfile.value) return 'Connecter'
  if (connectionStatus.value.isConnected) return 'Déjà connecté'
  if (connectionStatus.value.requestSent) return 'Demande envoyée'
  if (connectionStatus.value.requestReceived) return 'Répondre'
  return 'Connecter'
})

const recommendationTabLabel = computed(() => {
  if (canRequestLetterValidation.value) return 'Demander une lettre'
  return 'Recommander'
})

const recommendationTabTitle = computed(() => {
  if (canRequestLetterValidation.value) return 'Demande de validation de lettre'
  if (canSendRecommendation.value) return 'Envoyer une recommandation'
  return 'Action indisponible'
})

const recommendationTabDescription = computed(() => {
  if (canRequestLetterValidation.value) {
    return `Envoyez une demande de lettre de recommandation Ã  ${profile.value.name}.`
  }
  if (canSendRecommendation.value) {
    return `Partagez une recommandation utile pour renforcer le profil de ${profile.value.name}.`
  }
  return "Ce profil ne propose pas d'action de recommandation pour votre rôle."
})

const connectionPanelTitle = computed(() => {
  if (connectionStatus.value.isConnected) return 'Déjà connecté'
  if (connectionStatus.value.requestSent) return 'Demande envoyée'
  if (connectionStatus.value.requestReceived) return 'Demande reçue'
  return 'Demande de connexion'
})

const connectionPanelDescription = computed(() => {
  if (isOwnProfile.value) return 'Vous consultez votre propre profil.'
  if (connectionStatus.value.isConnected) return `Vous êtes connecté avec ${profile.value.name}.`
  if (connectionStatus.value.requestSent) return `Votre demande à ${profile.value.name} est en attente.`
  if (connectionStatus.value.requestReceived) return `${profile.value.name} vous a envoyé une demande de connexion.`
  return `Envoyez une demande de connexion à ${profile.value.name} pour rester en contact.`
})

function applyConnectionStatus(status: any) {
  connectionStatus.value = {
    isConnected: Boolean(status?.isConnected),
    requestSent: Boolean(status?.requestSent),
    requestReceived: Boolean(status?.requestReceived),
    status: status?.status ?? 'NONE',
    connexionId: status?.connexionId == null ? null : String(status.connexionId)
  }
}

async function loadConnectionStatus() {
  if (!profileId.value || isOwnProfile.value || !localStorage.getItem('token')) {
    connectionStatus.value = defaultConnectionStatus()
    return
  }
  try {
    const { data } = await connexionService.getConnectionStatus(profileId.value)
    applyConnectionStatus(data?.data || data)
  } catch (error) {
    console.warn('Chargement statut connexion impossible', error)
    connectionStatus.value = defaultConnectionStatus()
  }
}

async function runConnectionAction(action: () => Promise<unknown>, successMessage: string, fallbackMessage: string) {
  if (connectionLoading.value) return
  connectionLoading.value = true
  connectionActionMessage.value = ''
  try {
    await action()
    connectionActionMessage.value = successMessage
  } catch (error: any) {
    connectionActionMessage.value = error?.response?.data?.message || fallbackMessage
  } finally {
    await loadConnectionStatus()
    connectionLoading.value = false
  }
}

async function sendConnectionRequest() {
  if (!profileId.value || isOwnProfile.value) return
  await runConnectionAction(
    () => connexionService.createConnexion({ id_destinataire: profileId.value, message: `Demande de connexion vers ${profile.value.name}` }),
    'Demande envoyée.',
    "Impossible d'envoyer la demande."
  )
}

async function cancelConnectionRequest() {
  const connexionId = connectionStatus.value.connexionId
  if (!connexionId) return
  await runConnectionAction(
    () => connexionService.supprimerConnexion(connexionId),
    'Demande annulée.',
    "Impossible d'annuler la demande."
  )
}

async function acceptConnectionRequest() {
  const connexionId = connectionStatus.value.connexionId
  if (!connexionId) return
  await runConnectionAction(
    () => connexionService.accepterConnexion(connexionId),
    'Connexion acceptée.',
    "Impossible d'accepter la demande."
  )
}

async function rejectConnectionRequest() {
  const connexionId = connectionStatus.value.connexionId
  if (!connexionId) return
  await runConnectionAction(
    () => connexionService.refuserConnexion(connexionId),
    'Demande refusée.',
    'Impossible de refuser la demande.'
  )
}

async function removeConnection() {
  const connexionId = connectionStatus.value.connexionId
  if (!connexionId) return
  await runConnectionAction(
    () => connexionService.supprimerConnexion(connexionId),
    'Connexion retirée.',
    'Impossible de retirer la connexion.'
  )
}

// ─── Share ────────────────────────────────────────────────────────────────────

const profileUrl = computed(() => `${window.location.origin}${route.path}`)
const encodedProfileUrl = computed(() => encodeURIComponent(profileUrl.value))
const encodedShareText = computed(() => encodeURIComponent(`Découvrez le profil de ${profile.value.name}`))

const gmailShareUrl = computed(() => `mailto:?subject=${encodedShareText.value}&body=${encodedShareText.value}%0A${encodedProfileUrl.value}`)
const linkedinShareUrl = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodedProfileUrl.value}`)
const whatsappShareUrl = computed(() => `https://wa.me/?text=${encodedShareText.value}%20${encodedProfileUrl.value}`)
const xShareUrl = computed(() => `https://twitter.com/intent/tweet?text=${encodedShareText.value}&url=${encodedProfileUrl.value}`)

async function copyProfileLink() {
  await navigator.clipboard.writeText(profileUrl.value)
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1600)
}

// ─── Profile edit – bio ───────────────────────────────────────────────────────

const editingAbout = ref(false)
const bioForm = ref('')

function applySavedProfile(savedProfile: any) {
  profile.value = {
    ...profile.value,
    bio: savedProfile?.bio ?? profile.value.bio,
    email: savedProfile?.email ?? profile.value.email,
    phone: savedProfile?.phone ?? profile.value.phone,
    location: savedProfile?.location ?? profile.value.location,
    linkedin: savedProfile?.linkedin ?? profile.value.linkedin,
    avatar: savedProfile?.avatar ?? profile.value.avatar,
    banner: savedProfile?.banner ?? profile.value.banner,
  }
}

async function saveProfileChanges(payload: Record<string, string>, successMessage: string) {
  if (savingProfile.value) return false
  savingProfile.value = true
  profileSuccess.value = ''
  profileSaveError.value = ''

  try {
    const savedProfile = await profileService.updateProfile(null, payload)
    applySavedProfile(savedProfile)
    profileSuccess.value = successMessage
    window.setTimeout(() => { profileSuccess.value = '' }, 3000)
    return true
  } catch (error: any) {
    profileSaveError.value =
      error?.response?.data?.message ||
      "Impossible d'enregistrer le profil pour le moment."
    return false
  } finally {
    savingProfile.value = false
  }
}

function openEditAbout() { bioForm.value = profile.value.bio; editingAbout.value = true }
async function saveBio() {
  const saved = await saveProfileChanges(
    { bio: bioForm.value },
    'Bio mise a jour avec succes.'
  )
  if (saved) editingAbout.value = false
}
function cancelBio() { bioForm.value = profile.value.bio; editingAbout.value = false }

// ─── Profile edit – contact ───────────────────────────────────────────────────

const editingContact = ref(false)
const contactForm = reactive({ email: '', phone: '', website: '', linkedin: '', github: '' })

function buildContactPayload() {
  const payload: Record<string, string> = {}
  if (contactForm.phone.trim()) payload.telephone = contactForm.phone.trim()
  if (contactForm.email.trim()) payload.email_professionnel = contactForm.email.trim()
  if (contactForm.linkedin.trim()) payload.linkedin_url = contactForm.linkedin.trim()
  return payload
}

function openEditContact() {
  Object.assign(contactForm, {
    email: profile.value.email || '',
    phone: profile.value.phone || '',
    website: profile.value.website || '',
    linkedin: profile.value.linkedin || '',
    github: profile.value.github || ''
  })
  editingContact.value = true
}

async function saveContact() {
  const payload: Record<string, string> = {}
  if (contactForm.email.trim()) payload.email_professionnel = contactForm.email.trim()
  if (contactForm.phone.trim()) payload.telephone = contactForm.phone.trim()
  if (contactForm.linkedin.trim()) payload.linkedin_url = contactForm.linkedin.trim()

  const saved = await saveProfileChanges(
    payload,
    'Informations de contact mises a jour avec succes.'
  )
  if (saved) {
    editingContact.value = false
  }
}

// ─── Profile edit – skills ────────────────────────────────────────────────────

const editingSkills = ref(false)
const skillForms = reactive({ tech: [] as string[], soft: [] as string[], newTech: '', newSoft: '' })

function openEditSkills() {
  skillForms.tech = [...technicalSkillNames.value]
  skillForms.soft = [...softSkillNames.value]
  skillForms.newTech = ''
  skillForms.newSoft = ''
  editingSkills.value = true
}

function addTechSkill() {
  const s = skillForms.newTech.trim()
  if (s && !skillForms.tech.includes(s)) skillForms.tech.push(s)
  skillForms.newTech = ''
}

function addSoftSkill() {
  const s = skillForms.newSoft.trim()
  if (s && !skillForms.soft.includes(s)) skillForms.soft.push(s)
  skillForms.newSoft = ''
}

function saveSkills() {
  profile.value.technicalSkills = skillForms.tech.map(name => ({ name, level: 75, description: '', projectsCount: 0 }))
  profile.value.softSkills = skillForms.soft.map(name => ({ name, level: 75, description: '', projectsCount: 0 }))
  editingSkills.value = false
}

// ─── Profile edit – entries (exp / form / cert / langue) ─────────────────────

const experiences = ref<Experience[]>([])
const formations = ref<Formation[]>([])
const certifications = ref<Certification[]>([])
const langues = ref<Langue[]>([])

const activeEntryModal = ref<EntrySection | null>(null)
const editingEntryId = ref<number | null>(null)

const expForm = reactive({ poste: '', entreprise: '', debut: '', fin: '', description: '' })
const formForm = reactive({ diplome: '', etablissement: '', debut: '', fin: '' })
const certForm = reactive({ titre: '', organisme: '', date: '' })
const langueForm = reactive({ nom: '', niveau: 'Courant' })

const entryModalTitle = computed(() => {
  const labels: Record<string, string> = { exp: 'une expérience', form: 'une formation', cert: 'une certification', langue: 'une langue' }
  return activeEntryModal.value ? labels[activeEntryModal.value] : ''
})

function openAddEntry(section: EntrySection) {
  editingEntryId.value = null
  if (section === 'exp') Object.assign(expForm, { poste: '', entreprise: '', debut: '', fin: '', description: '' })
  if (section === 'form') Object.assign(formForm, { diplome: '', etablissement: '', debut: '', fin: '' })
  if (section === 'cert') Object.assign(certForm, { titre: '', organisme: '', date: '' })
  if (section === 'langue') Object.assign(langueForm, { nom: '', niveau: 'Courant' })
  activeEntryModal.value = section
}

function openEditEntry(section: EntrySection, id: number) {
  editingEntryId.value = id
  if (section === 'exp') { const e = experiences.value.find(x => x.id === id)!; Object.assign(expForm, { ...e }) }
  if (section === 'form') { const f = formations.value.find(x => x.id === id)!; Object.assign(formForm, { ...f }) }
  if (section === 'cert') { const c = certifications.value.find(x => x.id === id)!; Object.assign(certForm, { ...c }) }
  if (section === 'langue') { const l = langues.value.find(x => x.id === id)!; Object.assign(langueForm, { ...l }) }
  activeEntryModal.value = section
}

function saveEntry() {
  const s = activeEntryModal.value
  if (!s) return
  const newId = Date.now()
  if (s === 'exp') {
    editingEntryId.value !== null
      ? (experiences.value = experiences.value.map(x => x.id === editingEntryId.value ? { ...x, ...expForm } : x))
      : experiences.value.push({ id: newId, ...expForm })
  }
  if (s === 'form') {
    editingEntryId.value !== null
      ? (formations.value = formations.value.map(x => x.id === editingEntryId.value ? { ...x, ...formForm } : x))
      : formations.value.push({ id: newId, ...formForm })
  }
  if (s === 'cert') {
    editingEntryId.value !== null
      ? (certifications.value = certifications.value.map(x => x.id === editingEntryId.value ? { ...x, ...certForm } : x))
      : certifications.value.push({ id: newId, ...certForm })
  }
  if (s === 'langue') {
    editingEntryId.value !== null
      ? (langues.value = langues.value.map(x => x.id === editingEntryId.value ? { ...x, ...langueForm } : x))
      : langues.value.push({ id: newId, ...langueForm })
  }
  activeEntryModal.value = null
}

function deleteEntry(section: EntrySection, id: number) {
  if (section === 'exp') experiences.value = experiences.value.filter(x => x.id !== id)
  if (section === 'form') formations.value = formations.value.filter(x => x.id !== id)
  if (section === 'cert') certifications.value = certifications.value.filter(x => x.id !== id)
  if (section === 'langue') langues.value = langues.value.filter(x => x.id !== id)
}

// ─── Post edit modal ──────────────────────────────────────────────────────────

const editingPostId = ref<number | null>(null)
const editPostSaving = ref(false)
const editPostError = ref('')
const editForm = reactive({
  description: '',
  imagePreview: null as string | null,
  imageFile: null as File | null,
})

function openEditPost(post: ProfilePost) {
  editingPostId.value = post.id ?? null
  editForm.description = post.description
  editForm.imagePreview = post.imageUrl || post.images?.[0] || null
  editForm.imageFile = null
  editPostError.value = ''
  showEditModal.value = true
}

async function saveEditPost() {
  if (!editingPostId.value) return
  const description = editForm.description.trim()
  if (!description) {
    editPostError.value = 'La description est obligatoire.'
    return
  }

  editPostSaving.value = true
  editPostError.value = ''

  try {
    const payload = new FormData()
    payload.append('contenu', description)
    payload.append('visibilite', 'PUBLIC')
    if (editForm.imageFile) payload.append('image', editForm.imageFile)

    await postService.updatePost(editingPostId.value, payload)
    await loadPosts()
    showEditModal.value = false
  } catch (error: any) {
    editPostError.value = error?.response?.data?.message || 'Impossible de modifier ce post.'
  } finally {
    editPostSaving.value = false
  }
}

async function deletePost(postOrId: ProfilePost | number) {
  const id = typeof postOrId === 'number' ? postOrId : postOrId.id
  if (!id) return

  try {
    await postService.deletePost(id)
    posts.value = posts.value.filter((post) => post.id !== id)
  } catch (error) {
    console.error('Erreur suppression post', error)
  }
}

function onEditImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  editForm.imageFile = file
  const reader = new FileReader()
  reader.onload = () => { editForm.imagePreview = reader.result as string }
  reader.readAsDataURL(file)
}

// ─── Post interactions ────────────────────────────────────────────────────────

function handleComment(id: number) {
  console.log('Commentaire sur le post', id)
}

async function handleSubmitComment(post: ProfilePost, contenu: string) {
  if (!post.id) return
  try {
    const response = await postService.addComment(post.id, contenu)
    const createdComment = response?.data?.data || response?.data
    const targetPost = posts.value.find((entry) => entry.id === post.id)
    if (targetPost) {
      const previousCommentCount = Number(targetPost.commentCount ?? targetPost.comments?.length ?? 0)
      const nextComment = {
        id: Number(createdComment?.id_commentaire ?? Date.now()),
        author: [createdComment?.auteur?.prenom, createdComment?.auteur?.nom].filter(Boolean).join(' ') || currentUserName.value,
        text: createdComment?.contenu || contenu,
        time: "A l'instant",
        avatar: resolveBackendAsset(createdComment?.auteur?.profil?.photo_profil || currentUserAvatar.value || ''),
      }
      targetPost.comments = [nextComment, ...(targetPost.comments || [])]
      targetPost.commentCount = previousCommentCount + 1
    }
  } catch (error) {
    console.error('Erreur ajout commentaire', error)
  }
}

async function handleLike(post: ProfilePost, liked: boolean) {
  if (!post.id) return
  try {
    if (liked) {
      await postService.reactToPost(post.id, 'JAIME')
    } else {
      await postService.removeReaction(post.id)
    }
    const targetPost = posts.value.find((entry) => entry.id === post.id)
    if (targetPost) {
      const previousLiked = Boolean(targetPost.liked)
      targetPost.liked = liked
      const currentCount = Number(targetPost.likeCount ?? 0)
      if (liked && !previousLiked) targetPost.likeCount = currentCount + 1
      if (!liked && previousLiked) targetPost.likeCount = Math.max(0, currentCount - 1)
    }
  } catch (error) {
    console.error('Erreur reaction post', error)
  }
}

async function handleRepost(post: ProfilePost, reposted: boolean) {
  if (!post.id) return
  try {
    if (reposted) {
      await postService.repost(post.id)
    } else {
      await postService.removeRepost(post.id)
    }
    const targetPost = posts.value.find((entry) => entry.id === post.id)
    if (targetPost) {
      const previousReposted = Boolean(targetPost.reposted)
      targetPost.reposted = reposted
      const currentCount = Number(targetPost.repostCount ?? 0)
      if (reposted && !previousReposted) targetPost.repostCount = currentCount + 1
      if (!reposted && previousReposted) targetPost.repostCount = Math.max(0, currentCount - 1)
    }
  } catch (error) {
    console.error('Erreur republication post', error)
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

const recommendationMessage = ref('')

async function sendRecommendation() {
  if (!canSendRecommendation.value || !profileId.value) return
  const message = recommendationMessage.value.trim()
  if (!message) return
  recommendationFeedback.value = ''
  recommendationError.value = ''
  try {
    await recommendationService.createRecommendation({
      id_etudiant_cible: profileId.value,
      message,
      role_auteur: userRole.value === 'professional' ? 'PROFESSIONNEL' : 'PROFESSEUR'
    })
    recommendationMessage.value = ''
    recommendationFeedback.value = 'Recommandation envoyee avec succes.'
    await loadRecommendations()
    window.setTimeout(() => { recommendationFeedback.value = '' }, 3000)
  } catch (error) {
    console.error('Erreur envoi recommandation', error)
    recommendationError.value = 'Impossible denvoyer cette recommandation pour le moment.'
  }
}

function onNewPostImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  newPostForm.imageFile = file
  const reader = new FileReader()
  reader.onload = () => { newPostForm.imagePreview = reader.result as string }
  reader.readAsDataURL(file)
}

function clearNewPostImage() {
  newPostForm.imageFile = null
  newPostForm.imagePreview = ''
}

function parseCsvList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function submitNewPost() {
  const content = newPostForm.content.trim()
  if (!canPublishPosts.value || !content) return

  postSubmitting.value = true
  postFeedback.value = ''
  postError.value = ''

  try {
    const payload = new FormData()
    payload.append('contenu', content)
    payload.append('visibilite', 'PUBLIC')
    if (newPostForm.imageFile) payload.append('image', newPostForm.imageFile)

    await postService.createPost(payload)
    newPostForm.content = ''
    clearNewPostImage()
    postFeedback.value = 'Publication envoyee avec succes.'
    await loadPosts()
    window.setTimeout(() => { postFeedback.value = '' }, 3000)
  } catch (error: any) {
    postError.value = error?.response?.data?.message || 'Impossible de publier ce post pour le moment.'
  } finally {
    postSubmitting.value = false
  }
}

async function submitProjectValidationRequest() {
  if (!canOpenProfessorRequests.value || !profileId.value) return
  if (!projectRequestForm.titre.trim()) {
    projectRequestError.value = 'Le titre du projet est obligatoire.'
    return
  }

  projectRequestLoading.value = true
  projectRequestSuccess.value = ''
  projectRequestError.value = ''

  try {
    const { data } = await projetService.createProjet({
      titre: projectRequestForm.titre.trim(),
      description: projectRequestForm.description.trim() || undefined,
      type: 'INTEGRATION',
      lien_github: projectRequestForm.lien_github.trim() || undefined,
      technologies: parseCsvList(projectRequestForm.technologies),
      id_professeur: profileId.value,
    })

    const createdProjectId = Number(data?.data?.id_projet)
    if (Number.isFinite(createdProjectId) && createdProjectId > 0) {
      await projetService.soumettreProjet(createdProjectId)
    }

    projectRequestSuccess.value = 'Projet envoye pour validation avec succes.'
    projectRequestForm.titre = ''
    projectRequestForm.description = ''
    projectRequestForm.technologies = ''
    projectRequestForm.lien_github = ''
    window.setTimeout(() => { projectRequestSuccess.value = '' }, 3000)
  } catch (error: any) {
    projectRequestError.value =
      error?.response?.data?.message || 'Impossible denvoyer cette demande de projet.'
  } finally {
    projectRequestLoading.value = false
  }
}

async function submitStageValidationRequest() {
  if (!canOpenProfessorRequests.value || !profileId.value) return
  if (!stageRequestForm.entreprise.trim() || !stageRequestForm.poste.trim()) {
    stageRequestError.value = 'Lentreprise et le poste sont obligatoires.'
    return
  }

  stageRequestLoading.value = true
  stageRequestSuccess.value = ''
  stageRequestError.value = ''

  try {
    await stageService.createStage({
      entreprise: stageRequestForm.entreprise.trim(),
      poste: stageRequestForm.poste.trim(),
      missions: stageRequestForm.missions.trim() || undefined,
      technologies: stageRequestForm.technologies.trim() || undefined,
      date_debut: stageRequestForm.date_debut || undefined,
      date_fin: stageRequestForm.date_fin || undefined,
      id_encadrant: profileId.value,
    })

    stageRequestSuccess.value = 'Stage envoye pour validation avec succes.'
    stageRequestForm.entreprise = ''
    stageRequestForm.poste = ''
    stageRequestForm.missions = ''
    stageRequestForm.technologies = ''
    stageRequestForm.date_debut = ''
    stageRequestForm.date_fin = ''
    window.setTimeout(() => { stageRequestSuccess.value = '' }, 3000)
  } catch (error: any) {
    stageRequestError.value =
      error?.response?.data?.message || 'Impossible denvoyer cette demande de stage.'
  } finally {
    stageRequestLoading.value = false
  }
}

async function submitLetterRequest() {
  if (!canRequestLetterValidation.value || !profileId.value) return

  letterRequestLoading.value = true
  letterRequestSuccess.value = ''
  letterRequestError.value = ''

  try {
    await lettreService.requestRecommendationLetter({
      id_professeur: profileId.value,
      motif: letterRequestForm.motif,
      date_souhaitee: letterRequestForm.date_souhaitee || undefined,
    })
    letterRequestSuccess.value = 'Demande de lettre envoyee avec succes.'
    window.setTimeout(() => { letterRequestSuccess.value = '' }, 3000)
  } catch (error: any) {
    letterRequestError.value =
      error?.response?.data?.message || 'Impossible denvoyer la demande pour le moment.'
  } finally {
    letterRequestLoading.value = false
  }
}

// ─── Navigate ─────────────────────────────────────────────────────────────────

function openPortfolio() {
  const targetId = profileId.value
  if (!targetId) return
  const from = userRole.value === 'teacher' ? 'prof' : userRole.value === 'professional' ? 'pro' : 'student'
  router.push(`/portfolio/${targetId}?from=${from}`)
}

async function uploadProfileAvatar(file: File) {
  if (!isOwnProfile.value) return

  profileSaveError.value = ''
  profileSuccess.value = ''
  savingProfile.value = true

  try {
    const uploadedUrl = await profileService.uploadAvatar(profile.value.id, file)
    if (!uploadedUrl) throw new Error('Photo upload response is empty')

    profile.value.avatar = uploadedUrl
    await loadProfile()
    profileSuccess.value = 'Photo de profil enregistree.'
    window.setTimeout(() => { profileSuccess.value = '' }, 3000)
  } catch (error: any) {
    console.warn('Upload de la photo de profil impossible', error)
    profileSaveError.value =
      error?.response?.data?.message || 'Impossible denregistrer la photo de profil.'
  } finally {
    savingProfile.value = false
  }
}

async function uploadProfileBanner(file: File) {
  if (!isOwnProfile.value) return

  profileSaveError.value = ''
  profileSuccess.value = ''
  savingProfile.value = true

  try {
    const uploadedUrl = await profileService.uploadBanner(profile.value.id, file)
    if (!uploadedUrl) throw new Error('Banner upload response is empty')

    profile.value.banner = uploadedUrl
    await loadProfile()
    profileSuccess.value = 'Banniere de profil enregistree.'
    window.setTimeout(() => { profileSuccess.value = '' }, 3000)
  } catch (error: any) {
    console.warn('Upload de la banniere de profil impossible', error)
    profileSaveError.value =
      error?.response?.data?.message || 'Impossible denregistrer la banniere de profil.'
  } finally {
    savingProfile.value = false
  }
}

// ─── API loaders ──────────────────────────────────────────────────────────────

async function loadProfile() {
  profileLoading.value = true
  profileError.value = ''
  try {
    const backendProfile = profileStudentId.value
      ? await profileService.getProfile(profileStudentId.value)
      : await profileService.getCurrentUser()

    profileRaw.value = backendProfile?.raw ?? null
    viewedProfileRole.value = normalizeBackendRole(backendProfile?.raw?.role)

    const rawStudent = backendProfile?.raw?.etudiant || {}
    const rawCompetences = Array.isArray(rawStudent?.competences) ? rawStudent.competences : []

    const technicalSkills = rawCompetences
      .filter((item: any) => String(item?.competence?.categorie || '').toUpperCase() !== 'COMPORTEMENTALE')
      .map((item: any) => ({
        name: item?.competence?.nom || 'Compétence',
        level: Number(item?.niveau_maitrise ?? 75),
        description: 'Compétence issue du profil étudiant.',
        projectsCount: 0
      }))

    const softSkills = rawCompetences
      .filter((item: any) => String(item?.competence?.categorie || '').toUpperCase() === 'COMPORTEMENTALE')
      .map((item: any) => ({
        name: item?.competence?.nom || 'Compétence',
        level: Number(item?.niveau_maitrise ?? 75),
        description: 'Compétence comportementale issue du profil étudiant.',
        projectsCount: 0
      }))

    profile.value = {
      ...profile.value,
      id: backendProfile.id,
      name: backendProfile.name,
      score: backendProfile.score,
      title: backendProfile.title,
      school: backendProfile.school,
      location: backendProfile.location,
      recos: backendProfile.recos,
      avatar: backendProfile.avatar,
      banner: backendProfile.banner,
      bio: backendProfile.bio,
      email: backendProfile.email,
      phone: backendProfile.phone || '',
      website: backendProfile.website,
      linkedin: backendProfile.linkedin,
      github: backendProfile.github || '',
      technicalSkills,
      softSkills
    }

    if (Array.isArray(backendProfile.posts)) posts.value = backendProfile.posts
    if (Array.isArray(backendProfile.recommendations)) recommendations.value = backendProfile.recommendations
    activeTab.value = resolveDefaultTab()
  } catch (error) {
    console.warn('Chargement du profil complet impossible', error)
    profileError.value = 'Impossible de charger ce profil pour le moment.'
    posts.value = []
    recommendations.value = []
  } finally {
    profileLoading.value = false
  }
}

async function loadPosts() {
  try {
    const { data } = await postService.getPosts(
      profileId.value ? { id_auteur: profileId.value } : {}
    )
    posts.value = (data.data || []).map(mapBackendPost)
  } catch (error) {
    console.warn('Chargement des posts impossible', error)
    posts.value = []
  }
}

async function loadRecommendations() {
  if (!isStudentProfile.value || !profileId.value) {
    recommendations.value = []
    return
  }
  try {
    const requests = [
      recommendationService.getRecommendations({
        id_etudiant_cible: profileId.value,
        statut: 'VALIDE'
      }),
    ]

    const canLoadOwnPendingRecommendations =
      !isOwnProfile.value &&
      canSendRecommendation.value &&
      currentUserId.value != null

    if (canLoadOwnPendingRecommendations) {
      requests.push(
        recommendationService.getRecommendations({
          id_etudiant_cible: profileId.value,
          id_auteur: currentUserId.value,
        }),
      )
    }

    const responses = await Promise.all(requests)
    const merged = new Map<number, Recommendation>()

    responses.forEach((response) => {
      const items = Array.isArray(response?.data?.data) ? response.data.data : []
      items.forEach((item: any) => {
        const mapped = mapBackendRecommendation(item)
        merged.set(mapped.id, mapped)
      })
    })

    recommendations.value = Array.from(merged.values()).sort((left, right) => right.id - left.id)
  } catch (error) {
    console.warn('Chargement des recommandations impossible', error)
    recommendations.value = []
  }
}

async function loadAttachedStatus() {
  if (!canAttachStudent.value || !profileId.value) return
  try {
    const { data } = await profApi.getAttachedStudentStatus(profileId.value)
    studentAttached.value = Boolean(data?.data?.attached)
  } catch (error) {
    console.warn('Chargement statut étudiant lié impossible', error)
  }
}

async function attachCurrentStudent() {
  if (!canAttachStudent.value || !profileId.value || studentAttached.value) return
  attachingStudent.value = true
  attachMessage.value = ''
  try {
    const { data } = await profApi.attachStudent({ id_etudiant: profileId.value })
    studentAttached.value = true
    attachMessage.value = data?.created ? 'Étudiant ajouté à votre liste.' : 'Cet étudiant est déjà dans votre liste.'
  } catch (error: any) {
    attachMessage.value = error?.response?.data?.message || "Impossible d'ajouter cet étudiant."
  } finally {
    attachingStudent.value = false
  }
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapBackendPost(post: any): ProfilePost {
  const auteur = post.auteur
  const collaborateurs = post.collaborateurs || []
  const collaboratorNames = collaborateurs
    .map((c: any) => fullName(c.utilisateur))
    .filter(Boolean)
  return {
    id: Number(post.id_poste),
    author: [fullName(auteur), ...collaboratorNames].filter(Boolean).join(' & ') || 'Auteur inconnu',
    subtitle: post.visibilite || 'Post portfolio',
    description: post.contenu,
    liked: Array.isArray(post.reactions)
      ? post.reactions.some((reaction: any) => Number(reaction?.auteur?.id_utilisateur) === currentUserId.value)
      : false,
    reposted: Array.isArray(post.reposts)
      ? post.reposts.some((repost: any) => Number(repost?.auteur?.id_utilisateur) === currentUserId.value)
      : false,
    avatar: resolveBackendAsset(auteur?.profil?.photo_profil || ''),
    images: post.image_url ? [resolveBackendAsset(post.image_url)] : [],
    imageUrl: post.image_url ? resolveBackendAsset(post.image_url) : undefined,
    likeCount: Number(post.compteurs_reactions?.JAIME ?? post.reactions?.length ?? 0),
    commentCount: Array.isArray(post.commentaires) ? post.commentaires.length : 0,
    repostCount: Number(post.compteur_reposts ?? post._count?.reposts ?? post.reposts?.length ?? 0),
    comments: Array.isArray(post.commentaires)
      ? post.commentaires.map((comment: any) => ({
          id: Number(comment.id_commentaire),
          author: fullName(comment.auteur) || 'Auteur inconnu',
          text: comment.contenu || '',
          time: "A l'instant",
          avatar: resolveBackendAsset(comment.auteur?.profil?.photo_profil || ''),
        }))
      : [],
  }
}

function mapBackendRecommendation(recommendation: any): Recommendation {
  const auteur = recommendation.auteur || {}
  const role = recommendation.role_auteur === 'PROFESSIONNEL'
    ? 'professional'
    : recommendation.role_auteur === 'ETUDIANT'
      ? 'student'
      : 'teacher'
  return {
    id: Number(recommendation.id_recommandation),
    author: fullName(auteur) || 'Auteur inconnu',
    role,
    avatar: resolveBackendAsset(auteur?.profil?.photo_profil || recommendation.avatar || ''),
    message: recommendation.message || '',
    date: "Aujourd'hui"
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fullName(user: any) {
  return [user?.prenom, user?.nom].filter(Boolean).join(' ')
}

function normalizeBackendRole(roleRaw: unknown): ProfileRole {
  const role = String(roleRaw || '').trim().toUpperCase()
  if (role === 'PROFESSEUR' || role === 'TEACHER') return 'teacher'
  if (role === 'PROFESSIONNEL' || role === 'PROFESSIONAL') return 'professional'
  return 'student'
}

function resolveBackendAsset(path: string) {
  if (!path || /^https?:\/\//.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const backendBase = apiBase.replace(/\/api\/?$/, '')
  return `${backendBase}${path}`
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Lifecycle & watchers ─────────────────────────────────────────────────────

onMounted(async () => {
  await loadProfile()
  await loadConnectionStatus()
  await loadPosts()
  await loadRecommendations()
  await loadAttachedStatus()
})

watch(() => route.query.tab, () => { activeTab.value = getRouteTab() })

watch(profileId, async () => {
  await loadProfile()
  loadAttachedStatus()
  connectionActionMessage.value = ''
  connectionStatus.value = defaultConnectionStatus()
  loadConnectionStatus()
  loadPosts()
  loadRecommendations()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f8;
}

.page-state {
  background: white;
  border-radius: 12px;
  padding: 22px;
  color: var(--text-dark);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.page-state--error { color: #dc2626; }

.profile-feedback {
  margin: 10px 0 0;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: var(--font-head);
  font-size: .86rem;
  font-weight: 700;
}

.profile-feedback--success {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.profile-feedback--error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
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
  padding: 24px 10px;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  transition: padding-left 0.3s ease;
}

.content.shifted { padding-left: 230px; }

.portfolio-tab {
  display: grid;
  gap: 14px;
}

.role-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.role-overview--edit {
  margin-bottom: 14px;
}

.role-overview-card {
  background: white;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.role-overview-card span {
  display: block;
  margin-bottom: 8px;
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .03em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: var(--font-head);
}

.role-overview-card strong {
  display: block;
  font-size: .92rem;
  color: var(--text-dark);
  line-height: 1.45;
}

.post-composer {
  background: white;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
  display: grid;
  gap: 14px;
}

.post-composer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.post-composer__head h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.post-composer__head p {
  font-size: .85rem;
  color: var(--text-muted);
}

.post-composer__badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eeecff;
  color: var(--purple);
  font-family: var(--font-head);
  font-size: .76rem;
  font-weight: 700;
  white-space: nowrap;
}

.composer-preview img {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}

.post-composer__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.post-upload-btn {
  width: fit-content;
}

.role-action-card {
  width: min(620px, 100%);
}

.role-action-card--wide {
  width: 100%;
}

.profile-top-popup {
  margin-top: 14px;
}

.connect-card--top {
  width: 100%;
}

/* ── Teacher actions ─────────────────────────────── */
.teacher-actions {
  margin-top: 14px;
  background: white;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.teacher-actions__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.teacher-actions h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.teacher-actions p,
.teacher-actions__message {
  font-size: .85rem;
  color: var(--text-muted);
}

.attach-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
  white-space: nowrap;
}

.attach-btn:disabled { opacity: .65; cursor: not-allowed; }

/* ── Recommendations ─────────────────────────────── */
.recommendations-list { display: grid; gap: 12px; }

.recommendation-card {
  display: flex;
  gap: 14px;
  background: white;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.recommendation-content { flex: 1; min-width: 0; }

.recommendation-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.recommendation-head h4 {
  font-family: var(--font-head);
  font-size: .95rem;
  color: var(--text-dark);
}

.recommendation-head p,
.recommendation-head span { font-size: .78rem; color: var(--text-muted); }

.recommendation-message { font-size: .9rem; line-height: 1.5; color: var(--text-dark); }

/* ── Connect tab ─────────────────────────────────── */
.requests-panel {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.connect-tab {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.connect-card {
  width: min(560px, 100%);
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.connect-card h3 { font-family: var(--font-head); font-size: 1rem; color: var(--text-dark); margin-bottom: 4px; }
.connect-card p { font-size: .85rem; color: var(--text-muted); }
.connection-message { margin-top: 8px; color: var(--purple) !important; font-weight: 700; }

.connection-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }

.connect-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
  white-space: nowrap;
}

.connect-btn.connected,
.connect-btn.pending { background: #eef2ff; color: var(--purple); }
.connect-btn.danger { background: rgba(220, 38, 38, .09); color: #dc2626; }
.connect-btn:disabled { opacity: .65; cursor: not-allowed; }

/* ── Share tab ───────────────────────────────────── */
.share-tab { display: flex; justify-content: center; margin-top: 18px; }

.share-card {
  width: min(620px, 100%);
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
  display: grid;
  gap: 16px;
}

.share-card h3 { font-family: var(--font-head); font-size: 1rem; color: var(--text-dark); margin-bottom: 4px; }
.share-card p { font-size: .85rem; color: var(--text-muted); }

.link-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
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

.link-box button {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 50px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
}

.share-actions { display: flex; flex-wrap: wrap; gap: 10px; }

.share-btn {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  color: white;
  font-family: var(--font-head);
  font-size: .82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.share-btn.gmail { background: #ea4335; }
.share-btn.linkedin { background: #0a66c2; }
.share-btn.whatsapp { background: #25d366; }
.share-btn.x { background: #111827; }

/* ── Modals ──────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(17, 24, 39, .45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
}

.modal-head h3 { font-family: var(--font-head); font-size: 1rem; }

.modal-head button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f3f4f6;
  font-size: 1.4rem;
  color: var(--text-dark);
}

/* Recos modal */
.recos-modal {
  width: min(520px, 92vw);
  max-height: 80vh;
  overflow: auto;
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .16);
}

.recommenders-list { display: grid; gap: 12px; }

.recommender { display: flex; align-items: center; gap: 12px; }
.recommender strong { font-family: var(--font-head); font-size: .9rem; }
.recommender p { font-size: .78rem; color: var(--text-muted); }

/* Entry modal */
.entry-modal {
  width: min(460px, 92vw);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .16);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.entry-modal-body {
  padding: 6px 20px 8px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.entry-modal-footer {
  padding: 14px 20px 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
}

/* Post edit modal */
.post-edit-modal {
  width: min(520px, 92vw);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .18);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.post-edit-body { padding: 0 20px 4px; overflow-y: auto; flex: 1; }

.post-edit-footer {
  padding: 14px 20px 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
}

.field-label {
  display: block;
  font-family: var(--font-head);
  font-size: .82rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 14px 0 6px;
}

.edit-textarea {
  width: 100%;
  min-height: 100px;
  resize: vertical;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: .9rem;
  color: var(--text-dark);
  outline: none;
  box-sizing: border-box;
}

.edit-textarea:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(79, 70, 229, .12); }

.current-photo-wrap { display: inline-block; }

.current-photo-img { max-width: 100%; max-height: 200px; border-radius: 8px; display: block; }

.remove-photo-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  height: 32px;
  padding: 0 14px;
  border-radius: 100px;
  background: #fff0f0;
  color: #dc2626;
  font-family: var(--font-head);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
}

.remove-photo-btn:hover { background: #ffe0e0; }

.add-photo-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border: 1.5px dashed #d1d5db;
  border-radius: 8px;
  color: var(--text-muted);
  font-family: var(--font-head);
  font-size: .82rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.add-photo-label:hover { border-color: var(--purple); color: var(--purple); }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ── Mini avatar ─────────────────────────────────── */
.mini-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #eeecff;
  color: var(--purple);
  font-family: var(--font-head);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.mini-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* ── Profile edit sections ───────────────────────── */
.profile-edit-sections { display: grid; gap: 12px; margin-top: 14px; }

.pedit-card {
  background: white;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.pedit-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

.pedit-head h3 { font-family: var(--font-head); font-size: 1rem; font-weight: 700; color: var(--text-dark); }

.btn-modifier {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 100px;
  background: white;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.btn-modifier:hover { border-color: var(--purple); color: var(--purple); }

.btn-add-entry {
  height: 34px;
  padding: 0 16px;
  border-radius: 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-add-entry:hover { opacity: .88; }

.pedit-bio-text { font-size: .9rem; line-height: 1.6; color: var(--text-dark); }
.pedit-row-actions { display: flex; gap: 10px; margin-top: 12px; }

/* Contact */
.contact-display { display: flex; flex-direction: column; gap: 8px; }

.contact-row { display: flex; align-items: center; gap: 8px; font-size: .86rem; color: var(--text-dark); }
.contact-row svg { flex-shrink: 0; color: var(--text-muted); }
.contact-link.linkedin-color { color: #0a66c2; font-weight: 600; }

/* Forms */
.contact-form { display: grid; gap: 10px; }
.form-field { display: flex; flex-direction: column; gap: 4px; }

.form-field label {
  font-family: var(--font-head);
  font-size: .75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .3px;
}

.form-field input,
.form-field select {
  height: 40px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 12px;
  font-family: var(--font-body);
  font-size: .88rem;
  color: var(--text-dark);
  background: white;
  transition: border-color 0.15s;
}

.form-field textarea {
  min-height: 80px;
  resize: vertical;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: .88rem;
  color: var(--text-dark);
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  outline: none;
}

.form-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* Skills */
.skills-group,
.skills-edit-group { margin-bottom: 12px; }
.skills-group:last-child,
.skills-edit-group:last-child { margin-bottom: 0; }

.skills-label { font-family: var(--font-head); font-size: .75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; }
.skills-chips { display: flex; flex-wrap: wrap; gap: 8px; }

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: .78rem;
  font-weight: 600;
  font-family: var(--font-head);
}

.skill-chip.tech { background: #eeecff; color: var(--purple); }
.skill-chip.soft { background: #f0fdf4; color: #16a34a; }

.skill-chip.editable button {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(0, 0, 0, .13);
  color: inherit;
  font-size: .68rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.skill-add-row { display: flex; gap: 6px; margin-top: 8px; }

.skill-add-row input {
  flex: 1;
  height: 36px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 10px;
  font-size: .82rem;
  font-family: var(--font-body);
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.15s;
}

.skill-add-row input:focus { border-color: var(--purple); }

.btn-add-skill {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--purple);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-skill:hover { opacity: .88; }

/* Entries */
.entry-item { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid #f0f2f8; }
.entry-item:first-of-type { border-top: none; }

.entry-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.entry-dot.blue { background: #3b82f6; }
.entry-dot.green { background: #22c55e; }

.entry-body { flex: 1; min-width: 0; }

.entry-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }

.entry-body strong { font-family: var(--font-head); font-size: .9rem; color: var(--text-dark); display: block; margin-bottom: 2px; }
.entry-sub { font-size: .82rem; color: var(--text-muted); margin-bottom: 2px; }
.entry-date { font-size: .78rem; color: var(--text-muted); margin-bottom: 2px; }
.entry-desc { font-size: .82rem; color: var(--text-dark); line-height: 1.5; margin-top: 4px; }

.entry-actions { display: flex; gap: 4px; flex-shrink: 0; }

.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: #f5f5f5;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background 0.15s, color 0.15s;
}

.icon-btn:hover { background: #eeecff; color: var(--purple); }
.icon-btn.delete:hover { background: #fff0f0; color: var(--error, #dc2626); }

/* Languages */
.langues-grid { display: flex; flex-wrap: wrap; gap: 10px; }

.langue-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
}

.langue-info strong { display: block; font-family: var(--font-head); font-size: .82rem; color: var(--text-dark); }
.langue-info span { font-size: .72rem; color: var(--text-muted); }

/* Shared buttons */
.send-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
}

.send-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.cancel-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px;
  background: #f3f4f6;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-weight: 700;
}

.cancel-btn:hover { background: #e5e7eb; }

/* Bio textarea */
.bio-textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: .9rem;
  color: var(--text-dark);
  outline: none;
  box-sizing: border-box;
}

.bio-textarea:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(79, 70, 229, .12); }

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 900px) {
  .content,
  .content.shifted { padding: 16px; }
  .role-overview { grid-template-columns: 1fr; }
  .recommendation-head { flex-direction: column; }
  .connect-card { flex-direction: column; align-items: flex-start; }
  .post-composer__head { flex-direction: column; }
}
</style>
