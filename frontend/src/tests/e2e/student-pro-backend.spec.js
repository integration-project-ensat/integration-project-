/**
 * TESTS E2E — Étudiant & Professionnel (Playwright)
 *
 * Approche : injection directe du token dans localStorage (pas de form login).
 * Le router guard vérifie uniquement localStorage.getItem('token') → pas d'appel API.
 * Seules les APIs des pages elles-mêmes sont mockées avec des patterns /api/ précis.
 *
 * ── ÉTUDIANT ──────────────────────────────────────────────────────────────
 * STU-01 : Token étudiant injecté → accès /profile autorisé
 * STU-02 : /profile affiche le nom Youssef Alaoui
 * STU-03 : Mode owner — 2 onglets (Modifier bio + Partager)
 * STU-04 : Clic Modifier bio → sections d'édition apparaissent
 * STU-05 : /feed se charge sans erreur
 *
 * ── PROFESSIONNEL ─────────────────────────────────────────────────────────
 * PRO-01 : Token pro injecté → accès /explore-pro autorisé
 * PRO-02 : /pro/dashboard se charge correctement
 * PRO-03 : /pro/top-profiles se charge correctement
 * PRO-04 : Pro sur /profile → pas en mode owner (pas d'onglet Modifier bio)
 *
 * ── SÉCURITÉ ──────────────────────────────────────────────────────────────
 * SEC-01 : Sans token → accès /profile redirigé vers /login
 * SEC-02 : Professionnel inactif → login refusé (erreur affichée)
 */

import { test, expect } from '@playwright/test'

// ─── Données simulées ────────────────────────────────────────────────────
const studentUser = {
  id: 1, id_utilisateur: 1,
  email: 'youssef.alaoui@test.com',
  nom: 'Alaoui', prenom: 'Youssef',
  role: 'student',
  profil: { bio: '', photo_profil: null, banniere: null }
}

const proUser = {
  id: 2, id_utilisateur: 2,
  email: 'pro.actif@test.com',
  nom: 'Benali', prenom: 'Karim',
  role: 'professional',
  profil: { bio: '', photo_profil: null, banniere: null }
}

// ─── Helper : injection localStorage (pas de form login) ─────────────────
async function injectSession(page, user) {
  await page.goto('/')
  await page.evaluate((u) => {
    localStorage.setItem('token', 'mock-jwt-token-' + u.role)
    localStorage.setItem('role', u.role)
    localStorage.setItem('user', JSON.stringify(u))
  }, user)
}

// ─── Helper : mock toutes les API calls (/api/**) ───────────────────────
async function mockAllApis(page, user) {
  const profileData = {
    ...user,
    id: user.id,
    id_utilisateur: user.id,
    etudiant: user.role === 'student'
      ? { filiere: 'Informatique', etablissement: 'ENSA Tanger' }
      : null,
    professionnel: user.role === 'professional'
      ? { entreprise: 'DigitalMaroc', poste: 'Directeur Technique' }
      : null,
    connections: [], recommendations: [], posts: []
  }

  await page.route('**/api/**', async route => {
    const url = route.request().url()
    const body = url.includes('/profil')
      ? JSON.stringify({ success: true, data: profileData })
      : JSON.stringify({ success: true, data: [] })
    await route.fulfill({ status: 200, contentType: 'application/json', body })
  })
}

// ─── Helper : mock réponse profil uniquement ─────────────────────────────
async function mockProfileApi(page, user) {
  await mockAllApis(page, user)
}

// ════════════════════════════════════════════════════════════════════════════
// ÉTUDIANT
// ════════════════════════════════════════════════════════════════════════════
test.describe('Étudiant — parcours complet', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // STU-01 : Token étudiant → accès /profile autorisé (pas redirigé /login)
  // ─────────────────────────────────────────────────────────────────────────
  test('STU-01 : token étudiant permet d\'accéder à /profile', async ({ page }) => {
    await mockProfileApi(page, studentUser)
    await injectSession(page, studentUser)
    await page.goto('/profile')
    await expect(page).not.toHaveURL(/login/, { timeout: 10000 })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // STU-02 : /profile affiche le vrai nom de l'étudiant
  // ─────────────────────────────────────────────────────────────────────────
  test('STU-02 : /profile affiche le nom Youssef Alaoui', async ({ page }) => {
    await mockProfileApi(page, studentUser)
    await injectSession(page, studentUser)
    await page.goto('/profile')
    const nameEl = page.locator('h1, .profile-name, .student-name').first()
    await expect(nameEl).toBeVisible({ timeout: 15000 })
    const text = await nameEl.textContent()
    expect(text.toLowerCase()).toMatch(/youssef|alaoui/)
  })

  // ─────────────────────────────────────────────────────────────────────────
  // STU-03 : Mode owner → exactement 2 onglets (Modifier bio + Partager)
  // ─────────────────────────────────────────────────────────────────────────
  test('STU-03 : profil owner — 2 onglets Modifier bio + Partager', async ({ page }) => {
    await mockProfileApi(page, studentUser)
    await injectSession(page, studentUser)
    await page.goto('/profile')
    // Attendre spécifiquement l'onglet owner (chargé après l'API)
    await page.waitForSelector('.tab.modifier-bio', { timeout: 15000 })
    const tabs = await page.locator('.tab').allTextContents()
    expect(tabs).toHaveLength(2)
    expect(tabs).toContain('Modifier bio')
    expect(tabs).toContain('Partager')
  })

  // ─────────────────────────────────────────────────────────────────────────
  // STU-04 : Clic "Modifier bio" → sections d'édition deviennent visibles
  // ─────────────────────────────────────────────────────────────────────────
  test('STU-04 : clic Modifier bio affiche les sections d\'édition', async ({ page }) => {
    await mockProfileApi(page, studentUser)
    await injectSession(page, studentUser)
    await page.goto('/profile')
    await page.waitForSelector('.tab.modifier-bio', { timeout: 15000 })
    await expect(page.locator('.profile-edit-sections')).not.toBeVisible()
    await page.locator('.tab.modifier-bio').click()
    await expect(page.locator('.profile-edit-sections')).toBeVisible()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // STU-05 : /feed se charge sans page d'erreur
  // ─────────────────────────────────────────────────────────────────────────
  test('STU-05 : /feed se charge sans erreur', async ({ page }) => {
    await page.route('**/api/post**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    )
    await page.route('**/api/notification**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    )
    await injectSession(page, studentUser)
    await page.goto('/feed')
    await expect(page.locator('main, .feed-container, .page')).toBeVisible({ timeout: 15000 })
    const hasError = await page.locator('.error-page, .error-boundary').isVisible()
    expect(hasError).toBe(false)
  })

})

// ════════════════════════════════════════════════════════════════════════════
// PROFESSIONNEL
// ════════════════════════════════════════════════════════════════════════════
test.describe('Professionnel — parcours complet', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // PRO-01 : Token pro → accès /explore-pro autorisé
  // ─────────────────────────────────────────────────────────────────────────
  test('PRO-01 : token pro permet d\'accéder à /explore-pro', async ({ page }) => {
    await page.route('**/api/profil**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    )
    await injectSession(page, proUser)
    await page.goto('/explore-pro')
    await expect(page).not.toHaveURL(/login/, { timeout: 10000 })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PRO-02 : /pro/dashboard se charge sans page blanche
  // ─────────────────────────────────────────────────────────────────────────
  test('PRO-02 : /pro/dashboard se charge correctement', async ({ page }) => {
    await page.route('**/api/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    )
    await injectSession(page, proUser)
    await page.goto('/pro/dashboard')
    await expect(page.locator('main, .dashboard, .page')).toBeVisible({ timeout: 15000 })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PRO-03 : /pro/top-profiles se charge correctement
  // ─────────────────────────────────────────────────────────────────────────
  test('PRO-03 : /pro/top-profiles se charge correctement', async ({ page }) => {
    await page.route('**/api/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    )
    await injectSession(page, proUser)
    await page.goto('/pro/top-profiles')
    await expect(page.locator('main, .page')).toBeVisible({ timeout: 15000 })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PRO-04 : Pro sur /profile → pas en mode owner (pas d'onglet Modifier bio)
  // ─────────────────────────────────────────────────────────────────────────
  test('PRO-04 : pro visitant /profile — pas en mode owner', async ({ page }) => {
    await mockProfileApi(page, proUser)
    await injectSession(page, proUser)
    await page.goto('/profile')
    await page.waitForSelector('.tabs', { timeout: 15000 })
    const tabs = await page.locator('.tab').allTextContents()
    expect(tabs).not.toContain('Modifier bio')
  })

})

// ════════════════════════════════════════════════════════════════════════════
// SÉCURITÉ
// ════════════════════════════════════════════════════════════════════════════
test.describe('Sécurité — accès et comptes', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // SEC-01 : Sans token → accès /profile redirigé vers /login
  // ─────────────────────────────────────────────────────────────────────────
  test('SEC-01 : accès /profile sans token → redirigé vers /login', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/profile')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SEC-02 : Professionnel inactif → login refusé (erreur affichée)
  // ─────────────────────────────────────────────────────────────────────────
  test('SEC-02 : professionnel inactif ne peut pas se connecter', async ({ page }) => {
    await page.route('**/api/auth/seconnecter', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Compte en attente d\'activation' })
      })
    )
    await page.goto('/login')
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    await page.fill('input[type="email"]', 'hamid.tazi@entreprise.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err, .error, [class*="error"]')).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveURL(/login/)
  })

})
