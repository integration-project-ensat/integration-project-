export const lettreService: {
  generateLetter(payload: any): Promise<any>

  getPdfUrl(id: number | string): string

  getMesLettres(
    studentId: number | string
  ): Promise<any>
}