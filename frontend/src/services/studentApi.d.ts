import type { AxiosResponse } from 'axios'

export interface StudentDashboardStats {
  scoreProfile: number
  niveau: string | null
  recommandations: number
  projets: number
  stages: number
  badges: number
  competences: number
  portfolio: number
}

export interface StudentDashboardActivity {
  action: string
  date: string
}

export interface StudentDashboardProfile {
  nom: string
  email: string
  filiere: string | null
  photo: string | null
}

export interface StudentDashboardData {
  stats: StudentDashboardStats
  profileProgress: number
  activities: StudentDashboardActivity[]
  profile: StudentDashboardProfile
}

export interface StudentOpportunity {
  id: string
  nom: string
  poste: string | null
  entreprise: string | null
  secteur: string | null
  adresse: string | null
  photo: string | null
}

export interface StudentProfileProgressSection {
  completed: boolean
  percentage: number
}

export interface ApiSuccess<T> {
  success: boolean
  data: T
}

declare const studentApi: {
  getStudentDashboard(params?: Record<string, unknown>): Promise<AxiosResponse<ApiSuccess<StudentDashboardData>>>
  getOpportunities(): Promise<AxiosResponse<ApiSuccess<{ professionnels: StudentOpportunity[] }>>>
  getRecentActivity(): Promise<AxiosResponse<ApiSuccess<Array<StudentDashboardActivity & { id: string }>>>>
  getProfileProgress(): Promise<AxiosResponse<ApiSuccess<{
    totalScore: number
    sections: Record<string, StudentProfileProgressSection>
  }>>>
}

export default studentApi
