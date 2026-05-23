class ApiResponse {
  static success(data, message = 'Succès') {
    return { success: true, message, data }
  }

  static created(data, message = 'Créé avec succès') {
    return { success: true, message, data }
  }

  static paginated(data, pagination, message = 'Succès') {
    return { success: true, message, data, pagination }
  }

  static notFound(resource = 'Ressource') {
    return { success: false, message: `${resource} introuvable` }
  }

  static validationError(errors) {
    return { success: false, message: 'Erreur de validation', errors }
  }

  static conflict(message = 'Conflit détecté') {
    return { success: false, message }
  }

  static serverError(message = 'Erreur serveur interne') {
    return { success: false, message }
  }

  static forbidden(message = 'Accès refusé') {
    return { success: false, message }
  }

  static unauthorized(message = 'Non authentifié') {
    return { success: false, message }
  }
}

module.exports = { ApiResponse }