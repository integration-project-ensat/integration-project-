declare type PostFormData = FormData

export declare const postService: {
  getPosts(params?: Record<string, unknown>): Promise<any>
  getPost(id: number | string): Promise<any>
  createPost(formData: PostFormData): Promise<any>
  updatePost(id: number | string, formData: PostFormData): Promise<any>
  deletePost(id: number | string): Promise<any>
  reactToPost(id: number | string, type?: string): Promise<any>
  removeReaction(id: number | string): Promise<any>
  repost(id: number | string): Promise<any>
  removeRepost(id: number | string): Promise<any>
}
