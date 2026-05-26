export declare const recommendationService: {
  getRecommendations(params?: Record<string, unknown>): Promise<any>
  createRecommendation(payload: Record<string, unknown>): Promise<any>
  getRecommendationCount(params?: Record<string, unknown>): Promise<any>
  validerRecommendation(id: number | string): Promise<any>
  refuserRecommendation(id: number | string, motif_refus?: string): Promise<any>
  addToPortfolio(id: number | string, payload: Record<string, unknown>): Promise<any>
}
