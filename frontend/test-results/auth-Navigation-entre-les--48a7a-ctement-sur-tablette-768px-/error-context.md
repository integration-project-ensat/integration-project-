# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Navigation entre les pages d'auth >> NAV-04 : La page /login s'affiche correctement sur tablette (768px)
- Location: src\tests\e2e\auth.spec.js:242:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[type="submit"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button[type="submit"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - img "Vue logo" [ref=e4]
      - generic [ref=e6]:
        - heading "You did it!" [level=1] [ref=e7]
        - heading "You’ve successfully created a project with Vite + Vue 3." [level=3] [ref=e8]:
          - text: You’ve successfully created a project with
          - link "Vite" [ref=e9] [cursor=pointer]:
            - /url: https://vite.dev/
          - text: +
          - link "Vue 3" [ref=e10] [cursor=pointer]:
            - /url: https://vuejs.org/
          - text: .
    - main [ref=e11]:
      - generic [ref=e12]:
        - img [ref=e14]
        - generic [ref=e16]:
          - heading "Documentation" [level=3] [ref=e17]
          - text: Vue’s
          - link "official documentation" [ref=e18] [cursor=pointer]:
            - /url: https://vuejs.org/
          - text: provides you with all information you need to get started.
      - generic [ref=e19]:
        - img [ref=e21]
        - generic [ref=e23]:
          - heading "Tooling" [level=3] [ref=e24]
          - text: This project is served and bundled with
          - link "Vite" [ref=e25] [cursor=pointer]:
            - /url: https://vite.dev/guide/features.html
          - text: . The recommended IDE setup is
          - link "VSCode" [ref=e26] [cursor=pointer]:
            - /url: https://code.visualstudio.com/
          - text: +
          - link "Vue - Official" [ref=e27] [cursor=pointer]:
            - /url: https://github.com/vuejs/language-tools
          - text: . If you need to test your components and web pages, check out
          - link "Vitest" [ref=e28] [cursor=pointer]:
            - /url: https://vitest.dev/
          - text: and
          - link "Cypress" [ref=e29] [cursor=pointer]:
            - /url: https://www.cypress.io/
          - text: /
          - link "Playwright" [ref=e30] [cursor=pointer]:
            - /url: https://playwright.dev/
          - text: .
          - text: More instructions are available in
          - link "README.md" [ref=e31] [cursor=pointer]:
            - /url: javascript:void(0)
            - code [ref=e32]: README.md
          - text: .
      - generic [ref=e33]:
        - img [ref=e35]
        - generic [ref=e37]:
          - heading "Ecosystem" [level=3] [ref=e38]
          - text: "Get official tools and libraries for your project:"
          - link "Pinia" [ref=e39] [cursor=pointer]:
            - /url: https://pinia.vuejs.org/
          - text: ","
          - link "Vue Router" [ref=e40] [cursor=pointer]:
            - /url: https://router.vuejs.org/
          - text: ","
          - link "Vue Test Utils" [ref=e41] [cursor=pointer]:
            - /url: https://test-utils.vuejs.org/
          - text: ", and"
          - link "Vue Dev Tools" [ref=e42] [cursor=pointer]:
            - /url: https://github.com/vuejs/devtools
          - text: . If you need more resources, we suggest paying
          - link "Awesome Vue" [ref=e43] [cursor=pointer]:
            - /url: https://github.com/vuejs/awesome-vue
          - text: a visit.
      - generic [ref=e44]:
        - img [ref=e46]
        - generic [ref=e48]:
          - heading "Community" [level=3] [ref=e49]
          - text: Got stuck? Ask your question on
          - link "Vue Land" [ref=e50] [cursor=pointer]:
            - /url: https://chat.vuejs.org
          - text: (our official Discord server), or
          - link "StackOverflow" [ref=e51] [cursor=pointer]:
            - /url: https://stackoverflow.com/questions/tagged/vue.js
          - text: . You should also follow the official
          - link "@vuejs.org" [ref=e52] [cursor=pointer]:
            - /url: https://bsky.app/profile/vuejs.org
          - text: Bluesky account or the
          - link "@vuejs" [ref=e53] [cursor=pointer]:
            - /url: https://x.com/vuejs
          - text: X account for latest news in the Vue world.
      - generic [ref=e54]:
        - img [ref=e56]
        - generic [ref=e58]:
          - heading "Support Vue" [level=3] [ref=e59]
          - text: As an independent project, Vue relies on community backing for its sustainability. You can help us by
          - link "becoming a sponsor" [ref=e60] [cursor=pointer]:
            - /url: https://vuejs.org/sponsor/
          - text: .
  - generic [ref=e61]:
    - generic "Toggle devtools panel" [ref=e62] [cursor=pointer]:
      - img [ref=e63]
    - generic "Toggle Component Inspector" [ref=e68] [cursor=pointer]:
      - img [ref=e69]
```

# Test source

```ts
  145 | })
  146 | 
  147 | // ─────────────────────────────────────────────
  148 | // MODULE MOT DE PASSE OUBLIÉ
  149 | // ─────────────────────────────────────────────
  150 | test.describe('Mot de passe oublié', () => {
  151 | 
  152 |   test('affiche une erreur pour un email invalide', async ({ page }) => {
  153 |     await page.goto('/forgot')
  154 |     await page.fill('input[type="email"]', 'emailinvalide')
  155 |     await page.click('button[type="submit"]')
  156 |     await expect(page.locator('.err')).toHaveText('Nous ne trouvons pas votre e-mail.')
  157 |   })
  158 | 
  159 |   test('affiche une erreur si le champ email est vide', async ({ page }) => {
  160 |     await page.goto('/forgot')
  161 |     await page.click('button[type="submit"]')
  162 |     await expect(page.locator('.err')).toHaveText('Nous ne trouvons pas votre e-mail.')
  163 |   })
  164 | 
  165 |   test('redirige vers /verify-code avec un email valide', async ({ page }) => {
  166 |     await page.goto('/forgot')
  167 |     await page.fill('input[type="email"]', 'test@test.com')
  168 |     await page.click('button[type="submit"]')
  169 |     await expect(page).toHaveURL(/.*verify-code/)
  170 |     await expect(page).toHaveURL(/.*email=test%40test.com/)
  171 |   })
  172 | 
  173 | })
  174 | 
  175 | // ─────────────────────────────────────────────
  176 | // MODULE RÉINITIALISATION DU MOT DE PASSE
  177 | // ─────────────────────────────────────────────
  178 | test.describe('Réinitialisation du mot de passe', () => {
  179 | 
  180 |   test('affiche une erreur si les champs sont vides', async ({ page }) => {
  181 |     await page.goto('/reset-password')
  182 |     await page.click('button[type="submit"]')
  183 |     await expect(page.locator('.err')).toHaveText('Veuillez remplir tous les champs')
  184 |   })
  185 | 
  186 |   test('affiche une erreur si les mots de passe ne correspondent pas', async ({ page }) => {
  187 |     await page.goto('/reset-password')
  188 |     await page.fill('input[type="email"]', 'test@test.com')
  189 |     await page.fill('input[placeholder="Mot de passe"]', 'motdepasse123')
  190 |     await page.fill('input[placeholder="Comfirmer le mot de passe"]', 'autremotdepasse')
  191 |     await page.click('button[type="submit"]')
  192 |     await expect(page.locator('.err')).toHaveText('Le mot de passe ne correspond pas.')
  193 |   })
  194 | 
  195 |   test('affiche un message de succès et redirige vers /login', async ({ page }) => {
  196 |     await page.goto('/reset-password')
  197 |     await page.fill('input[type="email"]', 'test@test.com')
  198 |     await page.fill('input[placeholder="Mot de passe"]', 'nouveauMotDePasse123')
  199 |     await page.fill('input[placeholder="Comfirmer le mot de passe"]', 'nouveauMotDePasse123')
  200 |     await page.click('button[type="submit"]')
  201 |     await expect(page.locator('.success')).toHaveText('Mot de passe réinitialisé !')
  202 |     await expect(page).toHaveURL(/.*login/, { timeout: 5000 })
  203 |   })
  204 | 
  205 | })
  206 | 
  207 | // ─────────────────────────────────────────────
  208 | // MODULE NAVIGATION - Liens entre les pages
  209 | // ─────────────────────────────────────────────
  210 | test.describe('Navigation entre les pages d\'auth', () => {
  211 | 
  212 |   // NAV-01 : Lien S'inscrire depuis /login → /signup
  213 |   test('NAV : le lien S\'inscrire depuis /login redirige vers /signup', async ({ page }) => {
  214 |     await page.goto('/login')
  215 |     await page.click('.switch a')
  216 |     await expect(page).toHaveURL(/.*signup/)
  217 |   })
  218 | 
  219 |   // NAV-02 : Lien Retour depuis /forgot → /login
  220 |   test('NAV : le lien Retour depuis /forgot redirige vers /login', async ({ page }) => {
  221 |     await page.goto('/forgot')
  222 |     await page.click('.back')
  223 |     await expect(page).toHaveURL(/.*login/)
  224 |   })
  225 | 
  226 |   // NAV-03 : Lien Retour depuis /verify-code → /login
  227 |   test('NAV : le lien Retour depuis /verify-code redirige vers /login', async ({ page }) => {
  228 |     await page.goto('/verify-code')
  229 |     await page.click('.back')
  230 |     await expect(page).toHaveURL(/.*login/)
  231 |   })
  232 | 
  233 |   // NAV-03 : Responsive mobile (375px)
  234 |   test('NAV-03 : La page /login s\'affiche correctement sur mobile (375px)', async ({ page }) => {
  235 |     await page.setViewportSize({ width: 375, height: 667 })
  236 |     await page.goto('/login')
  237 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  238 |     await expect(page.locator('input[type="email"]')).toBeVisible()
  239 |   })
  240 | 
  241 |   // NAV-04 : Responsive tablette (768px)
  242 |   test('NAV-04 : La page /login s\'affiche correctement sur tablette (768px)', async ({ page }) => {
  243 |     await page.setViewportSize({ width: 768, height: 1024 })
  244 |     await page.goto('/login')
> 245 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  246 |   })
  247 | 
  248 |   // ERR-01 : URL inexistante → page 404 ou redirection
  249 |   test('ERR-01 : Une URL inexistante ne plante pas l\'application', async ({ page }) => {
  250 |     await page.goto('/abcxyz')
  251 |     // L'application doit soit rediriger, soit afficher une page d'erreur
  252 |     const url = page.url()
  253 |     const body = await page.locator('body').isVisible()
  254 |     expect(body).toBe(true)
  255 |     // Ne pas être sur une page complètement blanche/cassée
  256 |     const content = await page.locator('body').textContent()
  257 |     expect(content?.length).toBeGreaterThan(0)
  258 |   })
  259 | 
  260 | })
  261 | 
```