declare const authService: {
  login(email: string, password: string): Promise<any>
  signup(payload: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    role: string
    [key: string]: string
  }): Promise<any>
  forgotPassword(email: string): Promise<any>
  verifyCode(email: string, code: string): Promise<any>
  resendCode(email: string): Promise<any>
  resetPassword(payload: {
    token: string
    newPassword: string
    confirmPassword: string
  }): Promise<any>
  logout(): void
}

export default authService
