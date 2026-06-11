<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SideBar
        :role="userRole"
        :user="currentUser"
        :isOpen="sidebarOpen"
      />

      <main class="content" :class="{ shifted: sidebarOpen }">
        <StudentProfileHeader
          :profile="profile"
          :recent-recommendations="recommendations"
          v-model="activeTab"
          :is-owner="true"
          @open-recos="showRecosModal = true"
          @avatar-changed="profile.avatar = $event"
          @banner-changed="profile.banner = $event"
        />

        <!-- Modifier bio (profil complet) -->
        <section v-if="activeTab === 'Modifier bio'" class="profile-edit-sections">

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
                <button type="button" class="send-btn" @click="saveBio">Enregistrer</button>
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
                <button type="button" class="send-btn" @click="saveContact">Enregistrer</button>
                <button type="button" class="cancel-btn" @click="editingContact = false">Annuler</button>
              </div>
            </template>
          </div>

          <!-- Compétences -->
          <div class="pedit-card">
            <div class="pedit-head">
              <h3>Compétences</h3>
              <button v-if="!editingSkills" type="button" class="btn-modifier" @click="openEditSkills">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Modifier
              </button>
            </div>
            <template v-if="!editingSkills">
              <div v-if="technicalSkills.length" class="skills-group">
                <p class="skills-label">Techniques</p>
                <div class="skills-chips"><span v-for="s in technicalSkills" :key="s" class="skill-chip tech">{{ s }}</span></div>
              </div>
              <div v-if="softSkills.length" class="skills-group">
                <p class="skills-label">Comportementales</p>
                <div class="skills-chips"><span v-for="s in softSkills" :key="s" class="skill-chip soft">{{ s }}</span></div>
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
                    <div><h4>{{ r.author }}</h4><p>{{ r.role === 'teacher' ? 'Professeur' : 'Professionnel' }}</p></div>
                    <span>{{ r.date }}</span>
                  </div>
                  <p class="recommendation-message">{{ r.message || 'Recommandation sans commentaire.' }}</p>
                </div>
              </article>
            </div>
          </div>

        </section>

        <!-- Posts (toujours visibles) -->
        <section class="posts-section">
          <div v-for="post in posts" :key="post.id" class="post-wrapper">
            <div class="post-owner-bar">
              <button type="button" class="btn-post-action edit" @click="openEditPost(post)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Modifier
              </button>
              <button type="button" class="btn-post-action delete" @click="deletePost(post.id)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Supprimer
              </button>
            </div>
            <PostCard :post="post" @comment="handleComment(post.id)" @share="handleShare(post.id)" />
          </div>
          <div v-if="posts.length === 0" class="empty-posts">
            Aucun post pour l'instant.
          </div>
        </section>
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
        </div>
        <div class="post-edit-footer">
          <button type="button" class="send-btn" @click="saveEditPost">Enregistrer</button>
          <button type="button" class="cancel-btn" @click="showEditModal = false">Annuler</button>
        </div>
      </div>
    </div>

    <div
      v-if="showRecosModal"
      class="modal-backdrop"
      @click.self="showRecosModal = false"
    >
      <div class="recos-modal">
        <div class="modal-head">
          <h3>Personnes qui ont recommandé {{ profile.name }}</h3>
          <button type="button" @click="showRecosModal = false">×</button>
        </div>

        <div class="recommenders-list">
          <div
            v-for="recommendation in recommendations"
            :key="recommendation.id"
            class="recommender"
          >
            <div class="mini-avatar">
              <img
                v-if="recommendation.avatar"
                :src="recommendation.avatar"
                alt=""
              />
              <span v-else>{{ getInitials(recommendation.author) }}</span>
            </div>

            <div>
              <strong>{{ recommendation.author }}</strong>
              <p>
                {{ recommendation.role === 'teacher' ? 'Professeur' : 'Professionnel' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import TopBar from '../components/TopBar.vue'
import SideBar from '../components/exploreStudent/Sidebar.vue'
import StudentProfileHeader from '../components/StudentProfileHeader.vue'
import PostCard from '../components/PostCard.vue'

type Recommendation = {
  id: number
  author: string
  role: 'teacher' | 'professional'
  avatar?: string
  message?: string
  date: string
}

const sidebarOpen = ref(false)
const userRole = ref<'student' | 'teacher' | 'professional'>('teacher')
const activeTab = ref('Portfolio')
const showRecosModal = ref(false)
const recommendationMessage = ref('')

const currentUser = {
  name: 'Nom Professeur',
  email: 'professeur@univ.ac.ma',
  avatar: ''
}

const profile = reactive({
  name: 'Nom Prenom',
  score: 90,
  title: 'Ex Developpeur Operations & Support',
  school: 'Ex Dassault Université de Bretagne Occidentale',
  location: 'Ex Tanger, Tanger-Tetouan-Hussima, Maroc',
  recos: '500+',
  avatar: '',
  banner: '',
  bio: 'Étudiant motivé, intéressé par le développement web, les projets académiques et la collaboration avec des enseignants et professionnels.',
  email: 'exemple.exemple@univ.etu.ac.ma',
  phone: '+212 6 00 00 00 00',
  website: 'https://portfolio.example.com',
  linkedin: 'https://linkedin.com/in/example',
  github: 'https://github.com/example'
})

const recommendations = ref<Recommendation[]>([
  {
    id: 1,
    author: 'Mme Professeur Nom',
    role: 'teacher',
    avatar: '',
    message: 'Étudiant sérieux, autonome et très impliqué dans ses projets.',
    date: '23 Mai 2026'
  },
  {
    id: 2,
    author: 'Mr Professionnel Nom',
    role: 'professional',
    avatar: '',
    message: 'Très bonne capacité d’analyse et excellent esprit de collaboration.',
    date: '20 Mai 2026'
  },
  {
    id: 3,
    author: 'Mme Professeur Exemple',
    role: 'teacher',
    avatar: '',
    message: '',
    date: '18 Mai 2026'
  }
])

const connectionSent = ref(false)

function sendConnectionRequest() {
  connectionSent.value = true
  console.log('Demande de connexion envoyée à', profile.name)
}

const posts = ref([
  {
    id: 1,
    author: 'Nom Prenom & Nom Prenom',
    subtitle: 'Ex Collaboration pour un projet académique',
    description: 'Ex de description d\'un projet académique ou une stage application de gestion de biblio d\'une application web permettant de gérer les livres, les emprunts et les utilisateurs en sous supervision de Mme @k3blghzal et Mr @fianfiani en collaboration ... pour faire quelque chose.',
    avatar: '',
    images: [],
    imagePreview: null as string | null
  }
])

const copied = ref(false)
const showEditModal = ref(false)
const editingPostId = ref<number | null>(null)
const editForm = reactive({ description: '', imagePreview: null as string | null })
const bioForm = ref(profile.bio)

const profileUrl = computed(() => {
  return `${window.location.origin}/profile`
})

const encodedProfileUrl = computed(() => encodeURIComponent(profileUrl.value))
const encodedShareText = computed(() => encodeURIComponent(`Découvrez le profil de ${profile.name}`))

const gmailShareUrl = computed(() => {
  return `mailto:?subject=${encodedShareText.value}&body=${encodedShareText.value}%0A${encodedProfileUrl.value}`
})

const linkedinShareUrl = computed(() => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedProfileUrl.value}`
})

const whatsappShareUrl = computed(() => {
  return `https://wa.me/?text=${encodedShareText.value}%20${encodedProfileUrl.value}`
})

const xShareUrl = computed(() => {
  return `https://twitter.com/intent/tweet?text=${encodedShareText.value}&url=${encodedProfileUrl.value}`
})

async function copyProfileLink() {
  await navigator.clipboard.writeText(profileUrl.value)
  copied.value = true

  window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

function sendRecommendation() {
  recommendations.value.unshift({
    id: Date.now(),
    author: currentUser.name,
    role: 'teacher',
    avatar: currentUser.avatar,
    message: recommendationMessage.value.trim(),
    date: 'Aujourd’hui'
  })

  recommendationMessage.value = ''
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function handleComment(id: number) {
  console.log('Commentaire sur le post', id)
}

function handleShare(id: number) {
  console.log('Partager le post', id)
}

function openEditPost(post: any) {
  editingPostId.value = post.id
  editForm.description = post.description
  editForm.imagePreview = post.imagePreview ?? null
  showEditModal.value = true
}

function saveEditPost() {
  const idx = posts.value.findIndex(p => p.id === editingPostId.value)
  if (idx !== -1) {
    posts.value[idx].description = editForm.description
    posts.value[idx].imagePreview = editForm.imagePreview
  }
  showEditModal.value = false
}

function deletePost(id: number) {
  posts.value = posts.value.filter(p => p.id !== id)
}

function onEditImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { editForm.imagePreview = reader.result as string }
  reader.readAsDataURL(file)
}

// --- À propos ---
const editingAbout = ref(false)
function openEditAbout() { bioForm.value = profile.bio; editingAbout.value = true }
function saveBio() { profile.bio = bioForm.value; editingAbout.value = false }
function cancelBio() { bioForm.value = profile.bio; editingAbout.value = false }

// --- Contact ---
const editingContact = ref(false)
const contactForm = reactive({ email: '', phone: '', website: '', linkedin: '', github: '' })
function openEditContact() {
  Object.assign(contactForm, { email: profile.email || '', phone: profile.phone || '', website: profile.website || '', linkedin: profile.linkedin || '', github: profile.github || '' })
  editingContact.value = true
}
function saveContact() {
  Object.assign(profile, { email: contactForm.email, phone: contactForm.phone, website: contactForm.website, linkedin: contactForm.linkedin, github: contactForm.github })
  editingContact.value = false
}

// --- Compétences ---
const editingSkills = ref(false)
const technicalSkills = ref(['Vue.js', 'TypeScript', 'Node.js', 'Docker', 'PostgreSQL'])
const softSkills = ref(['Travail en équipe', 'Communication', 'Autonomie'])
const skillForms = reactive({ tech: [] as string[], soft: [] as string[], newTech: '', newSoft: '' })
function openEditSkills() { skillForms.tech = [...technicalSkills.value]; skillForms.soft = [...softSkills.value]; skillForms.newTech = ''; skillForms.newSoft = ''; editingSkills.value = true }
function addTechSkill() { const s = skillForms.newTech.trim(); if (s && !skillForms.tech.includes(s)) skillForms.tech.push(s); skillForms.newTech = '' }
function addSoftSkill() { const s = skillForms.newSoft.trim(); if (s && !skillForms.soft.includes(s)) skillForms.soft.push(s); skillForms.newSoft = '' }
function saveSkills() { technicalSkills.value = [...skillForms.tech]; softSkills.value = [...skillForms.soft]; editingSkills.value = false }

// --- Listes (Exp, Form, Cert, Langue) ---
interface Experience { id: number; poste: string; entreprise: string; debut: string; fin: string; description: string }
interface Formation { id: number; diplome: string; etablissement: string; debut: string; fin: string }
interface Certification { id: number; titre: string; organisme: string; date: string }
interface Langue { id: number; nom: string; niveau: string }

const experiences = ref<Experience[]>([
  { id: 1, poste: 'Développeur Full Stack', entreprise: 'OCP Group', debut: '2025-07', fin: '2025-09', description: 'Développement d\'une application interne de gestion RH.' }
])
const formations = ref<Formation[]>([
  { id: 1, diplome: 'Ingénierie Informatique et Réseaux', etablissement: 'ENSA Tanger', debut: '2023', fin: '2026' }
])
const certifications = ref<Certification[]>([
  { id: 1, titre: 'AWS Cloud Practitioner', organisme: 'Amazon Web Services', date: 'Jan 2025' }
])
const langues = ref<Langue[]>([
  { id: 1, nom: 'Arabe', niveau: 'Natif' },
  { id: 2, nom: 'Français', niveau: 'Courant' },
  { id: 3, nom: 'Anglais', niveau: 'Professionnel' }
])

type EntrySection = 'exp' | 'form' | 'cert' | 'langue'
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
  const s = activeEntryModal.value; if (!s) return
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
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f8;
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

.content.shifted {
  padding-left: 230px;
}

.recommend-tab {
  display: grid;
  gap: 16px;
  margin-top: 14px;
}

.recommend-box,
.recommendation-card,
.recos-modal {
  background: white;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.recommend-box h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.recommend-box p {
  font-size: .85rem;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.recommend-box textarea {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: .9rem;
  color: var(--text-dark);
  outline: none;
}

.recommend-box textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .12);
}

.send-btn {
  margin-top: 12px;
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px 100px 100px 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
}

.recommendations-list {
  display: grid;
  gap: 12px;
}

.recommendation-card {
  display: flex;
  gap: 14px;
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

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
.recommendation-head span {
  font-size: .78rem;
  color: var(--text-muted);
}

.recommendation-message {
  font-size: .9rem;
  line-height: 1.5;
  color: var(--text-dark);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(17, 24, 39, .45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recos-modal {
  width: min(520px, 92vw);
  max-height: 80vh;
  overflow: auto;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.modal-head h3 {
  font-family: var(--font-head);
  font-size: 1rem;
}

.modal-head button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f3f4f6;
  font-size: 1.4rem;
  color: var(--text-dark);
}

.recommenders-list {
  display: grid;
  gap: 12px;
}

.recommender {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recommender strong {
  font-family: var(--font-head);
  font-size: .9rem;
}

.recommender p {
  font-size: .78rem;
  color: var(--text-muted);
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

.connect-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.connect-card p {
  font-size: .85rem;
  color: var(--text-muted);
}

.connect-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px 100px 100px 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
  white-space: nowrap;
}

.connect-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

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

.mini-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-tab {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: .9rem;
}

@media (max-width: 900px) {
  .content,
  .content.shifted {
    padding: 16px;
  }

  .recommendation-head {
    flex-direction: column;
  }
}

.share-tab {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.share-card {
  width: min(620px, 100%);
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
  display: grid;
  gap: 16px;
}

.share-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.share-card p {
  font-size: .85rem;
  color: var(--text-muted);
}

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
  border-radius: 50px 50px 0 50px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
}

.share-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

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

.share-btn.gmail {
  background: #ea4335;
}

.share-btn.linkedin {
  background: #0a66c2;
}

.share-btn.whatsapp {
  background: #25d366;
}

.share-btn.x {
  background: #111827;
}

/* ==============================
   Profile edit sections
   ============================== */
.profile-edit-sections {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.pedit-card {
  background: white;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.pedit-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.pedit-head h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
}

/* Bouton "Modifier" (outline pill) */
.btn-modifier {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 16px;
  border: 1.5px solid #d1d5db;
  border-radius: var(--radius-pill);
  background: white;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--ease);
}

.btn-modifier:hover {
  border-color: var(--purple);
  color: var(--purple);
}

/* Bouton "+ Ajouter" (purple pill) */
.btn-add-entry {
  height: 34px;
  padding: 0 16px;
  border-radius: var(--radius-pill);
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--ease);
}

.btn-add-entry:hover { opacity: .88; }

.pedit-bio-text {
  font-size: .9rem;
  line-height: 1.6;
  color: var(--text-dark);
}

.pedit-row-actions { display: flex; gap: 10px; margin-top: 12px; }

/* Contact */
.contact-display { display: flex; flex-direction: column; gap: 8px; }

.contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .86rem;
  color: var(--text-dark);
}

.contact-row svg { flex-shrink: 0; color: var(--text-muted); }
.contact-link.linkedin-color { color: #0a66c2; font-weight: 600; }

/* Formulaires */
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
  transition: var(--ease);
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
  transition: var(--ease);
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  outline: none;
}

.form-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* Compétences */
.skills-group,
.skills-edit-group { margin-bottom: 12px; }
.skills-group:last-child,
.skills-edit-group:last-child { margin-bottom: 0; }

.skills-label {
  font-family: var(--font-head);
  font-size: .75rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.skills-chips { display: flex; flex-wrap: wrap; gap: 8px; }

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: var(--radius-pill);
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
  background: rgba(0,0,0,.13);
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
  transition: var(--ease);
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
  transition: var(--ease);
}

.btn-add-skill:hover { opacity: .88; }

/* Entrées (Exp, Form, Cert) */
.entry-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #f0f2f8;
}

.entry-item:first-of-type { border-top: none; }

.entry-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.entry-dot.blue { background: #3b82f6; }
.entry-dot.green { background: #22c55e; }

.entry-body { flex: 1; min-width: 0; }

.entry-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.entry-body strong {
  font-family: var(--font-head);
  font-size: .9rem;
  color: var(--text-dark);
  display: block;
  margin-bottom: 2px;
}

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
  transition: var(--ease);
}

.icon-btn:hover { background: #eeecff; color: var(--purple); }
.icon-btn.delete:hover { background: #fff0f0; color: var(--error); }

/* Langues */
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

.langue-info strong {
  display: block;
  font-family: var(--font-head);
  font-size: .82rem;
  color: var(--text-dark);
}

.langue-info span { font-size: .72rem; color: var(--text-muted); }

/* Modal CRUD entrées */
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

/* --- Bio edit (legacy) --- */
.bio-edit-tab { margin-top: 14px; }

.bio-edit-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.bio-edit-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 14px;
}

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

.bio-textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .12);
}

.bio-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
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

/* --- Posts section --- */
.posts-section {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.post-wrapper { position: relative; }

.post-owner-bar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 6px;
}

.btn-post-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 14px;
  border-radius: 100px;
  font-family: var(--font-head);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-post-action.edit { background: #eeecff; color: var(--purple); }
.btn-post-action.edit:hover { background: #ddd9ff; }
.btn-post-action.delete { background: #fff0f0; color: #dc2626; }
.btn-post-action.delete:hover { background: #ffe0e0; }

.empty-posts {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: .9rem;
}

/* --- Post edit modal --- */
.post-edit-modal {
  width: min(520px, 92vw);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .18);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.post-edit-body {
  padding: 0 20px 4px;
  overflow-y: auto;
  flex: 1;
}

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

.edit-textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .12);
}

.current-photo-wrap { display: inline-block; }

.current-photo-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  display: block;
}

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

.add-photo-label:hover {
  border-color: var(--purple);
  color: var(--purple);
}

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

</style>