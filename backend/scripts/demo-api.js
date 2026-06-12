/**
 * demo-api.js
 * Script de démonstration de l'API Integration Project
 * 
 * Usage : node scripts/demo-api.js
 */

const BASE_URL = 'http://localhost:3000'

// ─── Utilitaires ────────────────────────────────────────────────────────────

// Affiche un titre de section
const section = (titre) => {
  console.log('\n' + '='.repeat(50))
  console.log(`  ${titre}`)
  console.log('='.repeat(50))
}

// Fait une requête HTTP et affiche le résultat
const request = async (methode, endpoint, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method: methode, headers }
  if (body) options.body = JSON.stringify(body)

  try {
    console.log(`\n→ ${methode} ${endpoint}`)
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    console.log(`← Status: ${response.status}`)
    console.log('← Réponse:', JSON.stringify(data, null, 2))
    return { status: response.status, data }
  } catch (error) {
    console.error(`✗ Erreur: ${error.message}`)
    return null
  }
}

// ─── Démo principale ────────────────────────────────────────────────────────

const demo = async () => {
  console.log('\n🚀 Démarrage de la démo API Integration Project')
  console.log(`📡 Serveur: ${BASE_URL}`)

  // ── 1. Health Check ──────────────────────────────────────────────────────
  section('1. HEALTH CHECK')
  await request('GET', '/')

  // ── 2. Technologies ──────────────────────────────────────────────────────
  section('2. TECHNOLOGIES')

  console.log('\n📋 Liste des technologies :')
  await request('GET', '/api/technologies?page=1&limit=5')

  console.log('\n🔍 Détail technologie ID 1 :')
  await request('GET', '/api/technologies/1')

  // ── 3. Compétences ───────────────────────────────────────────────────────
  section('3. COMPÉTENCES')

  console.log('\n📋 Liste des compétences :')
  await request('GET', '/api/competences')

  console.log('\n🔍 Détail compétence ID 1 :')
  await request('GET', '/api/competences/1')

  // ── 4. Auth ──────────────────────────────────────────────────────────────
  section('4. AUTHENTIFICATION')

  console.log('\n📝 Inscription :')
  const inscription = await request('POST', '/api/auth/sinscrire', {
    nom: 'Dupont',
    prenom: 'Jean',
    email: `demo.${Date.now()}@email.com`,
    password: 'Password123!'
  })

  console.log('\n🔐 Connexion :')
  const connexion = await request('POST', '/api/auth/seconnecter', {
    email: 'demo@email.com',
    password: 'Password123!'
  })

  // Récupère le token si la connexion réussit
  const token = connexion?.data?.token || null

  if (token) {
    console.log('\n✅ Token JWT récupéré !')

    console.log('\n👤 Profil utilisateur connecté :')
    await request('GET', '/api/auth/profil', null, token)
  } else {
    console.log('\n⚠️  Pas de token — les routes protégées ne seront pas testées')
  }

  // ── 5. Résumé ─────────────────────────────────────────────────────────────
  section('RÉSUMÉ')
  console.log('✅ Démo terminée !')
  console.log('📚 Documentation Swagger : http://localhost:3000/api-docs')
  console.log('='.repeat(50) + '\n')
}

// Lance la démo
demo()