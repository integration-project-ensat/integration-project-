import api from "./api";

const getCurrentUserId = () => {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    const id = user?.id_utilisateur ?? user?.id;
    return id == null ? null : String(id);
  } catch {
    return null;
  }
};

const emptyStatus = {
  isConnected: false,
  requestSent: false,
  requestReceived: false,
  status: "NONE",
  connexionId: null,
};

const statusFromConnexions = (connexions, targetUserId) => {
  const currentUserId = getCurrentUserId();
  const targetId = String(targetUserId);

  if (!currentUserId || !targetId) return emptyStatus;

  const related = connexions.filter((connexion) => {
    const demandeurId = String(connexion?.demandeur_id ?? connexion?.demandeur?.id_utilisateur ?? "");
    const destinataireId = String(connexion?.destinataire_id ?? connexion?.destinataire?.id_utilisateur ?? "");

    return (
      (demandeurId === currentUserId && destinataireId === targetId) ||
      (demandeurId === targetId && destinataireId === currentUserId)
    );
  });

  const accepted = related.find((connexion) => String(connexion?.statut).toUpperCase() === "ACCEPTEE");
  if (accepted) {
    return {
      isConnected: true,
      requestSent: false,
      requestReceived: false,
      status: "ACCEPTEE",
      connexionId: String(accepted.id_connexion),
    };
  }

  const pending = related.find((connexion) => String(connexion?.statut).toUpperCase() === "EN_ATTENTE");
  if (!pending) return emptyStatus;

  const demandeurId = String(pending?.demandeur_id ?? pending?.demandeur?.id_utilisateur ?? "");

  return {
    isConnected: false,
    requestSent: demandeurId === currentUserId,
    requestReceived: demandeurId !== currentUserId,
    status: "EN_ATTENTE",
    connexionId: String(pending.id_connexion),
  };
};

export const connexionService = {
  getConnexions() {
    return api.get("/connexions");
  },

  getDemandesRecues() {
    return api.get("/connexions/recues");
  },

  getMesDemandes() {
    return api.get("/connexions/mes-demandes");
  },

  getMesConnexions() {
    return api.get("/connexions/mes-connexions");
  },

  async getConnectionStatus(userId) {
    try {
      return await api.get(`/connexions/status/${userId}`);
    } catch (error) {
      if (error?.response?.status !== 404) throw error;

      const response = await api.get("/connexions");
      const connexions = Array.isArray(response.data?.data) ? response.data.data : [];

      return {
        ...response,
        data: {
          success: true,
          data: statusFromConnexions(connexions, userId),
        },
      };
    }
  },

  createConnexion(payload) {
    const userId =
      payload?.userId ??
      payload?.id_destinataire ??
      payload?.id_utilisateur ??
      payload?.id;

    if (userId != null) {
      return this.getConnectionStatus(userId).then((response) => {
        const status = response.data?.data || response.data;

        if (status?.isConnected) {
          const error = new Error("Users are already connected");
          error.response = { data: { message: "Users are already connected" } };
          throw error;
        }

        if (status?.requestSent || status?.requestReceived) {
          const error = new Error("Request already exists");
          error.response = { data: { message: "Request already exists" } };
          throw error;
        }

        return api.post(`/connexions/${userId}`, payload);
      });
    }

    return api.post(`/connexions/${userId}`, payload);
  },

  accepterConnexion(id) {
    return api.patch(`/connexions/${id}/accepter`);
  },

  refuserConnexion(id) {
    return api.patch(`/connexions/${id}/refuser`);
  },

  supprimerConnexion(id) {
    return api.delete(`/connexions/${id}`);
  },
};
