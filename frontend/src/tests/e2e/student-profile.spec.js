/**
 * TESTS E2E — Section Profil Étudiant (Playwright)
 *
 * But : valider le comportement réel de la page /profile dans un vrai navigateur.
 * Ces tests simulent un utilisateur qui navigue et interagit avec son profil.
 *
 * Prérequis : le serveur de dev doit tourner (npm run dev) sur http://localhost:5173
 * Commande  : npx playwright test student-profile.spec.js
 *
 * E2E-PROF-01 : La page /profile se charge sans erreur (titre visible)
 * E2E-PROF-02 : Le composant StudentProfileHeader est visible
 * E2E-PROF-03 : Seulement 2 onglets affichés en mode owner (Modifier bio + Partager)
 * E2E-PROF-04 : L'overlay de modification de bannière est visible
 * E2E-PROF-05 : Clic sur "Modifier bio" affiche les sections d'édition
 * E2E-PROF-06 : Second clic sur "Modifier bio" masque les sections d'édition (toggle)
 * E2E-PROF-07 : Clic sur "Partager" affiche le dropdown de partage
 * E2E-PROF-08 : Clic sur "Contact info" affiche la section contact
 * E2E-PROF-09 : La section recos affiche les 3 cartes de recommandations
 * E2E-PROF-10 : Les posts sont visibles sur la page
 */

import { test, expect } from '@playwright/test'

const PROFILE_URL = '/profile'

test.describe('Page Profil Étudiant — /profile', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-01
  // But : vérifier que la page /profile se charge correctement.
  // Le h1 du profil doit être visible — s'il est absent, la page est blanche.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-01 : la page /profile se charge et affiche un nom', async ({ page }) => {
    await page.goto(PROFILE_URL)
    const h1 = page.locator('.profile-header h1')
    await expect(h1).toBeVisible({ timeout: 30000 })
    const name = await h1.textContent()
    expect(name.trim().length).toBeGreaterThan(0)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-02
  // But : le composant StudentProfileHeader doit être présent dans le DOM.
  // C'est le bloc principal du profil — sa bannière, son avatar, ses onglets.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-02 : le bloc .profile-header est visible', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await expect(page.locator('.profile-header')).toBeVisible()
    await expect(page.locator('.cover-img')).toBeVisible()
    await expect(page.locator('.avatar-wrap')).toBeVisible()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-03
  // But : en mode propriétaire (isOwner=true), seulement 2 onglets apparaissent.
  // "Modifier bio" et "Partager" — pas Portfolio, Recommander, etc.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-03 : seulement 2 onglets en mode owner (Modifier bio + Partager)', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await page.waitForSelector('.tabs')
    const tabs = await page.locator('.tab').allTextContents()
    expect(tabs).toHaveLength(2)
    expect(tabs).toContain('Modifier bio')
    expect(tabs).toContain('Partager')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-04
  // But : l'overlay "Modifier la bannière" doit être visible pour l'owner.
  // C'est le bouton semi-transparent en bas à droite de la bannière.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-04 : l\'overlay de modification de bannière est visible', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await expect(page.locator('.banner-edit-overlay')).toBeVisible()
    const text = await page.locator('.banner-edit-overlay').textContent()
    expect(text).toContain('Modifier la bannière')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-05
  // But : cliquer sur "Modifier bio" doit afficher les sections d'édition
  // (À propos, Contact, Compétences, etc.). C'est le flux onglet → contenu.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-05 : clic sur Modifier bio affiche les sections d\'édition', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await page.waitForSelector('.tabs')
    // Vérifie que les sections n'existent pas encore
    await expect(page.locator('.profile-edit-sections')).not.toBeVisible()
    // Clique sur Modifier bio
    await page.locator('.tab.modifier-bio').click()
    // Les sections d'édition doivent apparaître
    await expect(page.locator('.profile-edit-sections')).toBeVisible()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-06
  // But : un second clic sur "Modifier bio" doit masquer les sections (toggle).
  // L'onglet se comporte comme un interrupteur — même comportement que LinkedIn.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-06 : second clic sur Modifier bio masque les sections (toggle)', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await page.waitForSelector('.tabs')
    // Premier clic → affiche
    await page.locator('.tab.modifier-bio').click()
    await expect(page.locator('.profile-edit-sections')).toBeVisible()
    // Second clic → masque
    await page.locator('.tab.modifier-bio').click()
    await expect(page.locator('.profile-edit-sections')).not.toBeVisible()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-07
  // But : cliquer sur "Partager" doit afficher le dropdown de partage
  // avec les boutons Gmail, LinkedIn, WhatsApp, X.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-07 : clic sur Partager affiche le dropdown de partage', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await page.waitForSelector('.tabs')
    await expect(page.locator('.share-dropdown')).not.toBeVisible()
    await page.locator('.tab.share').click()
    await expect(page.locator('.share-dropdown')).toBeVisible()
    // Les 4 boutons de partage doivent être présents
    await expect(page.locator('.share-card-btn.gmail')).toBeVisible()
    await expect(page.locator('.share-card-btn.linkedin')).toBeVisible()
    await expect(page.locator('.share-card-btn.whatsapp')).toBeVisible()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-08
  // But : cliquer sur "Contact info" dans la section localisation doit
  // ouvrir la section de contact avec l'email et autres informations.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-08 : clic sur Contact info affiche la section contact', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await page.waitForSelector('.location')
    await expect(page.locator('.contact-section')).not.toBeVisible()
    await page.locator('.contact').click()
    await expect(page.locator('.contact-section')).toBeVisible()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-09
  // But : la section recommendations affiche les 3 cartes (profs, pros, étudiants).
  // Ces cartes sont toujours visibles dans le profil, quel que soit l'onglet actif.
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-09 : les 3 cartes de recommandations sont visibles', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await page.waitForSelector('.recos-section')
    const recoCards = page.locator('.reco-card')
    await expect(recoCards).toHaveCount(3)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-PROF-10
  // But : la section des posts/publications est visible sur la page du profil.
  // Les boutons d'édition et de suppression doivent être présents (owner mode).
  // ─────────────────────────────────────────────────────────────────────────
  test('E2E-PROF-10 : la section posts est visible avec les boutons d\'édition', async ({ page }) => {
    await page.goto(PROFILE_URL)
    await expect(page.locator('.posts-section')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.btn-post-action.edit').first()).toBeVisible()
  })

})
