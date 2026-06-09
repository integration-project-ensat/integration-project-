export const profileService: {
  getProfile(id?: number | string | null): Promise<any>
  getCurrentUser(): Promise<any>
  
}