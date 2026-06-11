export const profileService: {
  getProfile(id?: number | string | null): Promise<any>
  getCurrentUser(): Promise<any>
  updateProfile(id?: number | string | null, payload?: any): Promise<any>
  uploadAvatar(id?: number | string | null, file?: File): Promise<any>
}
