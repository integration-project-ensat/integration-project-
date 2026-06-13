import api from "./api";

const buildFormData = (payload = {}) => {
  const formData = new FormData();

  if (payload.contenu !== undefined) {
    formData.append("contenu", payload.contenu);
  }

  if (payload.visibilite) {
    formData.append("visibilite", payload.visibilite);
  }

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  if (Array.isArray(payload.collaborateurs) && payload.collaborateurs.length) {
    formData.append("collaborateurs", JSON.stringify(payload.collaborateurs));
  }

  return formData;
};

export const feedService = {
  getPosts(params = {}) {
    return api.get("/posts", { params });
  },

  getPost(id) {
    return api.get(`/posts/${id}`);
  },

  createPost(payload) {
    return api.post("/posts", buildFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePost(id, payload) {
    return api.patch(`/posts/${id}`, buildFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePost(id) {
    return api.delete(`/posts/${id}`);
  },

  likePost(id, type = "JAIME") {
    return api.post(`/posts/${id}/reactions`, { type });
  },

  unlikePost(id) {
    return api.delete(`/posts/${id}/reactions`);
  },

  repostPost(id) {
    return api.post(`/posts/${id}/reposts`);
  },

  removeRepost(id) {
    return api.delete(`/posts/${id}/reposts`);
  },

  createComment(id_poste, contenu) {
    return api.post(`/posts/${id_poste}/comments`, { contenu });
  },
};
