export const activiteService: {
  getMesActivites(params?: Record<string, any>): Promise<any>
  createActivite(payload: any): Promise<any>
  updateActivite(id: number | string, payload: any): Promise<any>
  deleteActivite(id: number | string): Promise<any>
}