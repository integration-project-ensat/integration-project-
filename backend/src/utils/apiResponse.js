class ApiResponse {
  /**
   * 200 OK — requête réussie avec données
   */
  static success(data, message = "Opération réussie") {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 201 Created
   */
  static created(data, message = "Ressource créée avec succès") {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 202 Accepted — action reçue, en attente de traitement ou de validation
   * Utilisé pour : recommandations en attente, commentaires en attente de modération
   */
  static accepted(message = "Votre demande a été reçue et est en attente de traitement") {
    return {
      success: true,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Réponse paginée — inclut meta (page, limit, total, totalPages)
   */
  static paginated(data, meta, message = "Données récupérées avec succès") {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 400 — erreurs de validation (champ → messages[])
   */
  static validationError(errors, message = "Les données envoyées sont invalides") {
    return {
      success: false,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 401 — non authentifié
   */
  static unauthorized(message = "Authentification requise pour accéder à cette ressource") {
    return {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 403 — accès interdit
   */
  static forbidden(message = "Vous n'avez pas les droits nécessaires pour effectuer cette action") {
    return {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 404 — ressource introuvable
   */
  static notFound(resource = "Ressource") {
    return {
      success: false,
      message: `${resource} introuvable`,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 409 — conflit ( email déjà utilisé, recommandation déjà soumise)
   */
  static conflict(message = "Cette ressource existe déjà ou est en conflit avec une donnée existante") {
    return {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 422 — entité non traitable (ex: règle de score incohérente, conflit de poids)
   */
  static unprocessable(message = "Les données sont syntaxiquement correctes mais ne peuvent pas être traitées") {
    return {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 500 — erreur serveur interne
   */
  static serverError(message = "Une erreur interne est survenue, veuillez réessayer plus tard") {
    return {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = { ApiResponse };