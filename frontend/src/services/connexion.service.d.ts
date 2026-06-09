export declare const connexionService: {
  getConnexions(): Promise<any>
  getDemandesRecues(): Promise<any>
  getMesDemandes(): Promise<any>
  getMesConnexions(): Promise<any>
  createConnexion(payload: Record<string, unknown>): Promise<any>
  accepterConnexion(id: number | string): Promise<any>
  refuserConnexion(id: number | string): Promise<any>
  supprimerConnexion(id: number | string): Promise<any>
}
