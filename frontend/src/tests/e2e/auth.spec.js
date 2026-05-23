// Tests E2E Playwright - Flux d'authentification complet
// Couvre : LOGIN (AUTH), INSCRIPTION, MOT DE PASSE OUBLIÉ, NAVIGATION

import { test, expect } from '@playwright/test'

// ─────────────────────────────────────────────
// MODULE AUTH - Connexion / Déconnexion
// ─────────────────────────────────────────────
test.describe('Authentification - Connexion', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
  })

  // AUTH-01 : Ouvrir l'application → redirect vers /login
  test('AUTH-01 : La racine / redirige vers /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*login/)
  })

  // AUTH-03 : Formulaire vide → erreur "Champs requis"
  test('AUTH-03 : Affiche Champs requis si le formulaire est soumis vide', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toHaveText('Champs requis')
  })

  // AUTH-04 : Email invalide (sans @) → le navigateur bloque la soumission
  test('AUTH-04 : Le navigateur bloque un email sans arobase', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'emailsansarobas')
    await page.fill('input[type="password"]', 'motdepasse123')
    await page.click('button[type="submit"]')
    // La validation HTML5 empêche la soumission — on reste sur /login
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('.err')).not.toBeVisible()
  })

  // AUTH-05 : Mauvais mot de passe → erreur affichée
  test('AUTH-05 : Affiche une erreur pour des identifiants incorrects', async ({ page }) => {
    await page.route('**/seconnecter', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Identifiants invalides' })
      })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@test.com')
    await page.fill('input[type="password"]', 'mauvaisMotDePasse')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toBeVisible()
  })

  // AUTH-06 : Bons identifiants → redirection vers /dashboard
  test('AUTH-06 : Redirige vers /dashboard après connexion réussie', async ({ page }) => {
    await page.route('**/seconnecter', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: { id: 1, email: 'test@test.com', role: 'student' }
        })
      })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', 'motDePasseCorrect')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  // AUTH-09 : Mot de passe vide, email rempli → erreur "Champs requis"
  test('AUTH-09 : Affiche une erreur si le mot de passe est vide', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@test.com')
    // On ne remplit pas le mot de passe
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toHaveText('Champs requis')
  })

})

// ─────────────────────────────────────────────
// MODULE SIGNUP - Inscription
// ─────────────────────────────────────────────
test.describe('Inscription', () => {

  // Affichage des champs selon le rôle sélectionné
  test('affiche les champs Étudiant quand rôle = student', async ({ page }) => {
    await page.goto('/signup')
    await page.selectOption('select', 'student')
    await expect(page.locator('input[placeholder="APOGEE"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Filière"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Année d\'étude"]')).toBeVisible()
  })

  test('affiche les champs Professeur quand rôle = Prof', async ({ page }) => {
    await page.goto('/signup')
    await page.selectOption('select', 'Prof')
    await expect(page.locator('input[placeholder="Département"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Code administration"]')).toBeVisible()
  })

  test('affiche les champs Professionnel quand rôle = Professional', async ({ page }) => {
    await page.goto('/signup')
    await page.selectOption('select', 'Professional')
    await expect(page.locator('input[placeholder="Post"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Entreprise"]')).toBeVisible()
  })

  test('affiche une erreur si le formulaire est soumis vide', async ({ page }) => {
    await page.goto('/signup')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toHaveText('Veuillez remplir tous les champs')
  })

  test('inscription réussie → redirige vers /dashboard', async ({ page }) => {
    await page.route('**/sinscrire', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'signup-token', user: { id: 2, role: 'student' } })
      })
    })

    await page.goto('/signup')
    await page.fill('input[placeholder="Nom"]', 'Ghailani')
    await page.fill('input[placeholder="Prenom"]', 'Test')
    await page.fill('input[placeholder="Saisir votre e-mail"]', 'nouveau@test.com')
    await page.fill('input[placeholder="Saisir une mot de passe"]', 'Motdepasse123')
    await page.fill('input[placeholder="Comfirmer le mot de passe"]', 'Motdepasse123')
    await page.selectOption('select', 'student')
    await page.fill('input[placeholder="APOGEE"]', '12345678')
    await page.fill('input[placeholder="Filière"]', 'Informatique')
    await page.fill('input[placeholder="Année d\'étude"]', '3')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*dashboard/)
  })

})

// ─────────────────────────────────────────────
// MODULE MOT DE PASSE OUBLIÉ
// ─────────────────────────────────────────────
test.describe('Mot de passe oublié', () => {

  test('affiche une erreur pour un email invalide', async ({ page }) => {
    await page.goto('/forgot')
    await page.fill('input[type="email"]', 'emailinvalide')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toHaveText('Nous ne trouvons pas votre e-mail.')
  })

  test('affiche une erreur si le champ email est vide', async ({ page }) => {
    await page.goto('/forgot')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toHaveText('Nous ne trouvons pas votre e-mail.')
  })

  test('redirige vers /verify-code avec un email valide', async ({ page }) => {
    await page.goto('/forgot')
    await page.fill('input[type="email"]', 'test@test.com')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*verify-code/)
    await expect(page).toHaveURL(/.*email=test%40test.com/)
  })

})

// ─────────────────────────────────────────────
// MODULE RÉINITIALISATION DU MOT DE PASSE
// ─────────────────────────────────────────────
test.describe('Réinitialisation du mot de passe', () => {

  test('affiche une erreur si les champs sont vides', async ({ page }) => {
    await page.goto('/reset-password')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toHaveText('Veuillez remplir tous les champs')
  })

  test('affiche une erreur si les mots de passe ne correspondent pas', async ({ page }) => {
    await page.goto('/reset-password')
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[placeholder="Mot de passe"]', 'motdepasse123')
    await page.fill('input[placeholder="Comfirmer le mot de passe"]', 'autremotdepasse')
    await page.click('button[type="submit"]')
    await expect(page.locator('.err')).toHaveText('Le mot de passe ne correspond pas.')
  })

  test('affiche un message de succès et redirige vers /login', async ({ page }) => {
    await page.goto('/reset-password')
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[placeholder="Mot de passe"]', 'nouveauMotDePasse123')
    await page.fill('input[placeholder="Comfirmer le mot de passe"]', 'nouveauMotDePasse123')
    await page.click('button[type="submit"]')
    await expect(page.locator('.success')).toHaveText('Mot de passe réinitialisé !')
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 })
  })

})

// ─────────────────────────────────────────────
// MODULE NAVIGATION - Liens entre les pages
// ─────────────────────────────────────────────
test.describe('Navigation entre les pages d\'auth', () => {

  // NAV-01 : Lien S'inscrire depuis /login → /signup
  test('NAV : le lien S\'inscrire depuis /login redirige vers /signup', async ({ page }) => {
    await page.goto('/login')
    await page.click('.switch a')
    await expect(page).toHaveURL(/.*signup/)
  })

  // NAV-02 : Lien Retour depuis /forgot → /login
  test('NAV : le lien Retour depuis /forgot redirige vers /login', async ({ page }) => {
    await page.goto('/forgot')
    await page.click('.back')
    await expect(page).toHaveURL(/.*login/)
  })

  // NAV-03 : Lien Retour depuis /verify-code → /login
  test('NAV : le lien Retour depuis /verify-code redirige vers /login', async ({ page }) => {
    await page.goto('/verify-code')
    await page.click('.back')
    await expect(page).toHaveURL(/.*login/)
  })

  // NAV-03 : Responsive mobile (375px)
  test('NAV-03 : La page /login s\'affiche correctement sur mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  // NAV-04 : Responsive tablette (768px)
  test('NAV-04 : La page /login s\'affiche correctement sur tablette (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // ERR-01 : URL inexistante → page 404 ou redirection
  test('ERR-01 : Une URL inexistante ne plante pas l\'application', async ({ page }) => {
    await page.goto('/abcxyz')
    // L'application doit soit rediriger, soit afficher une page d'erreur
    const body = await page.locator('body').isVisible()
    expect(body).toBe(true)
    // Ne pas être sur une page complètement blanche/cassée
    const content = await page.locator('body').textContent()
    expect(content?.length).toBeGreaterThan(0)
  })

})
