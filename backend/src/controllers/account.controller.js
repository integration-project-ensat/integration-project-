const accountService = require('../services/account.service')

const accountController = {
  async me(req, res, next) {
    try {
      const account = await accountService.findAccount(req.utilisateur.id_utilisateur)
      if (!account) {
        return res.status(404).json({ success: false, message: 'Compte introuvable' })
      }
      return res.json({ success: true, data: account })
    } catch (error) {
      next(error)
    }
  },

  async updateEmail(req, res, next) {
    try {
      const account = await accountService.updateEmail(req.utilisateur.id_utilisateur, {
        newEmail: req.body.newEmail,
        currentPassword: req.body.currentPassword
      })

      return res.json({
        success: true,
        message: 'Adresse e-mail mise à jour avec succès.',
        data: account
      })
    } catch (error) {
      next(error)
    }
  },

  async updatePassword(req, res, next) {
    try {
      await accountService.updatePassword(req.utilisateur.id_utilisateur, {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword
      })

      return res.json({
        success: true,
        message: 'Mot de passe mis à jour avec succès.',
        data: null
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = accountController
