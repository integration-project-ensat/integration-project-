export declare const feedService: {
  getPosts(params?: Record<string, unknown>): Promise<any>
  getPost(id: string | number): Promise<any>
  createPost(payload: Record<string, unknown>): Promise<any>
  updatePost(id: string | number, payload: Record<string, unknown>): Promise<any>
  deletePost(id: string | number): Promise<any>
  likePost(id: string | number, type?: string): Promise<any>
  unlikePost(id: string | number): Promise<any>
  repostPost(id: string | number): Promise<any>
  removeRepost(id: string | number): Promise<any>
  createComment(id_poste: string | number, contenu: string): Promise<any>
}
