export function getCareerRecommendation(payload: {
  targetCareer: string
  skills: string[]
  projects: string[]
  technologies: string[]
  badges: string[]
  stages: string[]
}): Promise<any>
