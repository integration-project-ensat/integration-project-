import api from "./api";

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

  createConnexion(payload) {
    const userId =
      payload?.userId ??
      payload?.id_destinataire ??
      payload?.id_utilisateur ??
      payload?.id;
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
