export declare const connexionService: {
  getConnexions(): Promise<any>
  createConnexion(payload: Record<string, unknown>): Promise<any>
  accepterConnexion(id: number | string): Promise<any>
  refuserConnexion(id: number | string): Promise<any>
}
