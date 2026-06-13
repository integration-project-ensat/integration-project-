export const profileService: {
  getProfile(id?: number | string | null): Promise<any>
  getCurrentUser(): Promise<any>
  updateProfile(userId: number | string | null | undefined, payload: Record<string, unknown>): Promise<any>
  uploadAvatar(id?: number | string | null, file?: File): Promise<any>
  uploadBanner(id?: number | string | null, file?: File): Promise<any>
}
