declare const authService: {
  login(email: string, password: string): Promise<any>
  signup(payload: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
  }): Promise<any>
  logout(): void
}

export default authService