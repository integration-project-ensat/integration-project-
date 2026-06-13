export const portfolioService: {
  getPortfolio(id: number): Promise<any>
  getPortfolioExportPdfUrl(id: number): string
  getPortfolioExportHtmlUrl(id: number): string
  getTemplates(): Promise<any>
  changeTemplate(id_modele: number): Promise<any>
}
