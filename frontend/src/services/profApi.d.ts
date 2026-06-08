declare const profApi: {
  getProfDashboard(): Promise<any>
  getAttachedStudents(): Promise<any>
  getAttachedStudentStatus(studentId: string | number): Promise<any>
  attachStudent(payload: Record<string, unknown>): Promise<any>
  importStudentsCsv(file: File): Promise<any>
  detachStudent(studentId: string | number): Promise<any>
  updateValidationStatus(request: Record<string, any>, status: string): Promise<any>
  updateRecommendationStatus(
    letterId: string | number,
    status: string,
    payload?: Record<string, unknown>
  ): Promise<any>
  getProDashboard(): Promise<any>
}

export default profApi
