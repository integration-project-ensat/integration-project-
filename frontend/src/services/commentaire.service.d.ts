export declare const commentaireService: {
  getCommentaires(params?: Record<string, unknown>): Promise<any>
  createCommentaire(payload: Record<string, unknown>): Promise<any>
  validerCommentaire(id: number | string): Promise<any>
  refuserCommentaire(id: number | string, motif_refus?: string): Promise<any>
  getHistorique(id: number | string): Promise<any>
}
