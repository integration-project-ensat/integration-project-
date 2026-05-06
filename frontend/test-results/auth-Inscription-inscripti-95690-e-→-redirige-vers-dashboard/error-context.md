# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Inscription >> inscription réussie → redirige vers /dashboard
- Location: src\tests\e2e\auth.spec.js:122:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="Nom"]')

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
  32  |     await page.fill('input[type="email"]', 'emailsansarobas')
  33  |     await page.fill('input[type="password"]', 'motdepasse123')
  34  |     await page.click('button[type="submit"]')
  35  |     // La validation HTML5 empêche la soumission — on reste sur /login
  36  |     await expect(page).toHaveURL(/.*login/)
  37  |     await expect(page.locator('.err')).not.toBeVisible()
  38  |   })
  39  | 
  40  |   // AUTH-05 : Mauvais mot de passe → erreur affichée
  41  |   test('AUTH-05 : Affiche une erreur pour des identifiants incorrects', async ({ page }) => {
  42  |     await page.route('**/seconnecter', async route => {
  43  |       await route.fulfill({
  44  |         status: 401,
  45  |         contentType: 'application/json',
  46  |         body: JSON.stringify({ message: 'Identifiants invalides' })
  47  |       })
  48  |     })
  49  | 
  50  |     await page.goto('/login')
  51  |     await page.fill('input[type="email"]', 'wrong@test.com')
  52  |     await page.fill('input[type="password"]', 'mauvaisMotDePasse')
  53  |     await page.click('button[type="submit"]')
  54  |     await expect(page.locator('.err')).toBeVisible()
  55  |   })
  56  | 
  57  |   // AUTH-06 : Bons identifiants → redirection vers /dashboard
  58  |   test('AUTH-06 : Redirige vers /dashboard après connexion réussie', async ({ page }) => {
  59  |     await page.route('**/seconnecter', async route => {
  60  |       await route.fulfill({
  61  |         status: 200,
  62  |         contentType: 'application/json',
  63  |         body: JSON.stringify({
  64  |           token: 'mock-jwt-token',
  65  |           user: { id: 1, email: 'test@test.com', role: 'student' }
  66  |         })
  67  |       })
  68  |     })
  69  | 
  70  |     await page.goto('/login')
  71  |     await page.fill('input[type="email"]', 'test@test.com')
  72  |     await page.fill('input[type="password"]', 'motDePasseCorrect')
  73  |     await page.click('button[type="submit"]')
  74  |     await expect(page).toHaveURL(/.*dashboard/)
  75  |   })
  76  | 
  77  |   // AUTH-09 : Mot de passe vide, email rempli → erreur "Champs requis"
  78  |   test('AUTH-09 : Affiche une erreur si le mot de passe est vide', async ({ page }) => {
  79  |     await page.goto('/login')
  80  |     await page.fill('input[type="email"]', 'test@test.com')
  81  |     // On ne remplit pas le mot de passe
  82  |     await page.click('button[type="submit"]')
  83  |     await expect(page.locator('.err')).toHaveText('Champs requis')
  84  |   })
  85  | 
  86  | })
  87  | 
  88  | // ─────────────────────────────────────────────
  89  | // MODULE SIGNUP - Inscription
  90  | // ─────────────────────────────────────────────
  91  | test.describe('Inscription', () => {
  92  | 
  93  |   // Affichage des champs selon le rôle sélectionné
  94  |   test('affiche les champs Étudiant quand rôle = student', async ({ page }) => {
  95  |     await page.goto('/signup')
  96  |     await page.selectOption('select', 'student')
  97  |     await expect(page.locator('input[placeholder="APOGEE"]')).toBeVisible()
  98  |     await expect(page.locator('input[placeholder="Filière"]')).toBeVisible()
  99  |     await expect(page.locator('input[placeholder="Année d\'étude"]')).toBeVisible()
  100 |   })
  101 | 
  102 |   test('affiche les champs Professeur quand rôle = Prof', async ({ page }) => {
  103 |     await page.goto('/signup')
  104 |     await page.selectOption('select', 'Prof')
  105 |     await expect(page.locator('input[placeholder="Département"]')).toBeVisible()
  106 |     await expect(page.locator('input[placeholder="Code administration"]')).toBeVisible()
  107 |   })
  108 | 
  109 |   test('affiche les champs Professionnel quand rôle = Professional', async ({ page }) => {
  110 |     await page.goto('/signup')
  111 |     await page.selectOption('select', 'Professional')
  112 |     await expect(page.locator('input[placeholder="Post"]')).toBeVisible()
  113 |     await expect(page.locator('input[placeholder="Entreprise"]')).toBeVisible()
  114 |   })
  115 | 
  116 |   test('affiche une erreur si le formulaire est soumis vide', async ({ page }) => {
  117 |     await page.goto('/signup')
  118 |     await page.click('button[type="submit"]')
  119 |     await expect(page.locator('.err')).toHaveText('Veuillez remplir tous les champs')
  120 |   })
  121 | 
  122 |   test('inscription réussie → redirige vers /dashboard', async ({ page }) => {
  123 |     await page.route('**/sinscrire', async route => {
  124 |       await route.fulfill({
  125 |         status: 201,
  126 |         contentType: 'application/json',
  127 |         body: JSON.stringify({ token: 'signup-token', user: { id: 2, role: 'student' } })
  128 |       })
  129 |     })
  130 | 
  131 |     await page.goto('/signup')
> 132 |     await page.fill('input[placeholder="Nom"]', 'Ghailani')
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  133 |     await page.fill('input[placeholder="Prenom"]', 'Test')
  134 |     await page.fill('input[placeholder="Saisir votre e-mail"]', 'nouveau@test.com')
  135 |     await page.fill('input[placeholder="Saisir une mot de passe"]', 'Motdepasse123')
  136 |     await page.fill('input[placeholder="Comfirmer le mot de passe"]', 'Motdepasse123')
  137 |     await page.selectOption('select', 'student')
  138 |     await page.fill('input[placeholder="APOGEE"]', '12345678')
  139 |     await page.fill('input[placeholder="Filière"]', 'Informatique')
  140 |     await page.fill('input[placeholder="Année d\'étude"]', '3')
  141 |     await page.click('button[type="submit"]')
  142 |     await expect(page).toHaveURL(/.*dashboard/)
  143 |   })
  144 | 
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
```