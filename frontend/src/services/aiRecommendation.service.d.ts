export function getCareerRecommendation(payload: {
  targetCareer: string
  studentId?: string | number
  skills: string[]
  projects: string[]
  technologies: string[]
  badges: string[]
  stages: string[]
  student?: Record<string, unknown>
}): Promise<any>
