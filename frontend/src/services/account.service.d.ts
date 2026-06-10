export interface AccountUser {
  id: string
  id_utilisateur: string
  nom: string
  prenom: string
  name: string
  email: string
  role: string
}

export declare const accountService: {
  getMe(): Promise<AccountUser>
  updateEmail(payload: {
    newEmail: string
    currentPassword: string
  }): Promise<{ success: boolean; message: string; data: AccountUser }>
  updatePassword(payload: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<{ success: boolean; message: string; data: null }>
}

export default accountService
