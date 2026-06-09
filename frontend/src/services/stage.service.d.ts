export const stageService: {
  getMesStages(params?: Record<string, any>): Promise<any>
  createStage(payload: any): Promise<any>
  updateStage(id: number | string, payload: any): Promise<any>
  deleteStage(id: number | string): Promise<any>
}