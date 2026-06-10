const bcrypt = require('bcryptjs')
const prisma = require('../../prisma/client')
const { AppError } = require('../config/errors')

const SALT_ROUNDS = 12

const toAccountDto = (user) => ({
  id: user.id_utilisateur.toString(),
  id_utilisateur: user.id_utilisateur.toString(),
  nom: user.nom,
  prenom: user.prenom,
  name: [user.prenom, user.nom].filter(Boolean).join(' ').trim(),
  email: user.email,
  role: user.role
})

async function findAccount(userId) {
  const user = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: BigInt(userId) },
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      email: true,
      role: true
    }
  })

  return user ? toAccountDto(user) : null
}

async function verifyCurrentPassword(userId, currentPassword) {
  if (!currentPassword) {
    throw new AppError('Mot de passe actuel requis.', 400)
  }

  const user = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: BigInt(userId) },
    select: {
      id_utilisateur: true,
      mot_de_passe_hashe: true
    }
  })

  if (!user?.mot_de_passe_hashe) {
    throw new AppError('Ce compte ne possède pas de mot de passe local.', 400)
  }

  const isValid = await bcrypt.compare(currentPassword, user.mot_de_passe_hashe)
  if (!isValid) {
    throw new AppError('Mot de passe actuel incorrect.', 400)
  }

  return user
}

async function updateEmail(userId, { newEmail, currentPassword }) {
  const normalizedEmail = String(newEmail || '').trim().toLowerCase()

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError('Adresse e-mail invalide.', 400)
  }

  await verifyCurrentPassword(userId, currentPassword)

  const existing = await prisma.utilisateur.findUnique({
    where: { email: normalizedEmail },
    select: { id_utilisateur: true }
  })

  if (existing && existing.id_utilisateur !== BigInt(userId)) {
    throw new AppError('Cet e-mail est déjà utilisé.', 409)
  }

  const updated = await prisma.utilisateur.update({
    where: { id_utilisateur: BigInt(userId) },
    data: { email: normalizedEmail },
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      email: true,
      role: true
    }
  })

  return toAccountDto(updated)
}

async function updatePassword(userId, { currentPassword, newPassword, confirmPassword }) {
  if (!newPassword || newPassword.length < 8) {
    throw new AppError('Le mot de passe doit contenir au moins 8 caractères.', 400)
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('Les mots de passe ne correspondent pas.', 400)
  }

  const user = await verifyCurrentPassword(userId, currentPassword)
  const isSamePassword = await bcrypt.compare(newPassword, user.mot_de_passe_hashe)

  if (isSamePassword) {
    throw new AppError("Le nouveau mot de passe doit être différent de l'ancien.", 400)
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

  await prisma.utilisateur.update({
    where: { id_utilisateur: BigInt(userId) },
    data: { mot_de_passe_hashe: hashedPassword }
  })

  return { updated: true }
}

module.exports = {
  findAccount,
  updateEmail,
  updatePassword
}
