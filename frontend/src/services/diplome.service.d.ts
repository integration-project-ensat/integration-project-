export const diplomeService: {
  getMesDiplomes(): Promise<any>
  getDiplomes(): Promise<any>
  createDiplome(payload: any): Promise<any>
  updateDiplome(id: number | string, payload: any): Promise<any>
  deleteDiplome(id: number | string): Promise<any>
}