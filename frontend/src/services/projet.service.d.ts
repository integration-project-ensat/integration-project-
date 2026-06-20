export const projetService: {
  getMesProjets(params?: Record<string, any>): Promise<any>
  createProjet(payload: any): Promise<any>
  updateProjet(id: number | string, payload: any): Promise<any>
  deleteProjet(id: number | string): Promise<any>
  soumettreProjet(id: number | string): Promise<any>
}