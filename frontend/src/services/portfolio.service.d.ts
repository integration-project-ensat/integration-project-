export const portfolioService: {
  getPortfolio(id: number): Promise<any>
  getPortfolioExportPdfUrl(id: number): string
  getPortfolioExportHtmlUrl(id: number): string
}