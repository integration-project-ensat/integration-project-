# SCRUM-37 — Rapport d'anomalies UI
**Projet :** PheraCore — Module Profil Étudiant  
**QA1 Frontend :** Aimad Eddine Slimani  
**Date :** 2026-05-13  
**Composant testé :** `StudentProfileHeader.vue` + `ProfileView.vue`

---

## Résumé des tests effectués

| Suite | Fichier | Tests | Résultat |
|-------|---------|-------|----------|
| SCRUM-34 UI | SCRUM34-StudentProfileUI.spec.js | 13 | ✅ Tous passent |
| SCRUM-35 Responsive | SCRUM35-ResponsiveBehavior.spec.js | 10 | ✅ Tous passent |
| SCRUM-36 Backend | SCRUM36-ProfileBackend.integration.spec.js | 8 | ✅ Tous passent |

---

## Anomalies détectées

### ANOMALIE-01 — Page `/reset-password` affiche une page blanche
- **Sévérité :** Haute
- **Composant :** `ResetPasswordView.vue`
- **Reproduction :** Naviguer vers `/reset-password?token=<token>` dans le navigateur
- **Comportement attendu :** Formulaire de réinitialisation du mot de passe visible
- **Comportement observé :** Page entièrement blanche, aucun contenu rendu
- **Cause probable :** Conflit CSS entre `#app { display: flex }` et le layout du composant, ou erreur JavaScript silencieuse au runtime
- **Action recommandée :** Ouvrir F12 → Console → vérifier les erreurs JS au chargement de la page
- **Signalé par :** QA2 Backend (message WhatsApp)
- **Tests E2E ajoutés :** RESET-DISPLAY-01 à 05 dans `auth.spec.js`

---

### ANOMALIE-02 — Couleur bannière convertie par jsdom (impact tests seulement)
- **Sévérité :** Faible (test uniquement, pas de bug prod)
- **Composant :** `StudentProfileHeader.vue` — bannière dynamique
- **Reproduction :** Test SPH-U-10 avec assertion `#1a3c5e`
- **Comportement observé :** jsdom convertit `#1a3c5e` en `rgb(26, 60, 94)` dans l'attribut style inline
- **Impact :** Aucun impact visuel en production — le navigateur affiche correctement la couleur hex
- **Action :** Assertion de test corrigée pour vérifier `rgb(26, 60, 94)` + `linear-gradient`
- **Statut :** Résolu dans les tests

---

### ANOMALIE-03 — Branche `student-profile` créée depuis `dev` (historique pollué)
- **Sévérité :** Moyenne
- **Type :** Git workflow
- **Description :** La branche `student-profile` avait été créée depuis `dev` au lieu de `main`, entraînant des commits de la page Explore dans son historique
- **Impact :** Le workflow GitHub Actions (mirror.yml) a signalé commit `0657e0e` (fix explore page layout) comme poussé par `slimo777` sur `dev`
- **Action :** Branche recréée depuis `main` avec cherry-pick du seul commit profil. Force push effectué.
- **Statut :** Résolu — la branche `student-profile` ne contient plus que 3 fichiers (delta vs `main`)

---

### ANOMALIE-04 — LinkedIn affiché même si null (risque potentiel)
- **Sévérité :** Faible
- **Composant :** `StudentProfileHeader.vue` — section liens sociaux
- **Description :** Le bloc `v-if="profile.github || profile.linkedin"` conditionne l'affichage de la section entière. Si seul LinkedIn est null mais GitHub est fourni, la section s'affiche sans LinkedIn — comportement correct.
- **Risque :** Si `profile.linkedin = ""` (chaîne vide) au lieu de `null`, le lien s'affichera avec href vide
- **Action recommandée :** Côté backend, s'assurer que les champs vides sont envoyés comme `null` et non comme `""`
- **Statut :** À surveiller — dépend de la validation côté backend

---

### ANOMALIE-05 — Skeleton non masqué si userId est null et API retourne mock
- **Sévérité :** Faible
- **Composant :** `StudentProfileHeader.vue`
- **Description :** Quand `userId = null`, le composant appelle `getProfile(null ?? localStorage ?? 1)` avec fallback `1`. L'API (ou le mock) répond, le skeleton disparaît normalement. Pas d'anomalie visuelle observée.
- **Observation :** Le fallback `1` comme userId par défaut peut être problématique en production si l'utilisateur n'est pas connecté — il verrait le profil de l'étudiant #1
- **Action recommandée :** Afficher un état "non connecté" plutôt que le profil #1 quand userId est null
- **Statut :** À corriger dans une prochaine itération

---

## Recommandations générales

1. **Priorité haute :** Corriger la page blanche de `/reset-password` (ANOMALIE-01) avant la soutenance
2. **Backend :** Normaliser les valeurs nulles dans l'API (ANOMALIE-04)
3. **UX :** Gérer l'état "non connecté" dans `StudentProfileHeader` (ANOMALIE-05)
4. **Tests E2E Playwright :** Les tests responsive visuels (CSS @media) nécessitent Playwright avec un vrai navigateur — les tests Vitest actuels valident la structure HTML mais pas le rendu CSS

---

## Commandes pour lancer les tests

```bash
# Depuis integration-project-/frontend/

# Tous les tests (unitaires + intégration)
npm run test:unit

# Un seul fichier
npx vitest run src/tests/unit/SCRUM34-StudentProfileUI.spec.js
npx vitest run src/tests/unit/SCRUM35-ResponsiveBehavior.spec.js
npx vitest run src/tests/integration/SCRUM36-ProfileBackend.integration.spec.js
```
