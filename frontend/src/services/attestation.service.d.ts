export const attestationService: {
  getAttestations(params?: Record<string, any>): Promise<any>

  createAttestation(payload: any): Promise<any>

  updateAttestation(
    id: number | string,
    payload: any
  ): Promise<any>

  deleteAttestation(
    id: number | string
  ): Promise<any>
}