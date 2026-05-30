from pathlib import Path
from typing import Dict, List

import joblib
import pandas as pd

from train_model import DATASET_PATH, MODEL_PATH, train_model


CAREER_REQUIREMENTS: Dict[str, Dict[str, List[str]]] = {
    "Web Developer": {
        "skills": ["HTML", "CSS", "JavaScript", "TypeScript", "Vue", "React", "Node.js", "REST API", "SQL", "Testing"],
        "technologies": ["Vue", "React", "Node.js", "Express", "PostgreSQL", "Docker"],
        "projects": ["Full-stack portfolio", "E-commerce app", "Admin dashboard", "Authentication system"],
    },
    "DevOps": {
        "skills": ["Linux", "Docker", "CI/CD", "GitHub Actions", "Kubernetes", "Nginx", "Monitoring", "Cloud"],
        "technologies": ["Docker", "Kubernetes", "GitHub Actions", "Prometheus", "Grafana", "Terraform"],
        "projects": ["Dockerized application", "CI/CD pipeline", "Kubernetes deployment", "Monitoring dashboard"],
    },
    "Cybersecurity": {
        "skills": ["Linux", "Networking", "OWASP", "Web Security", "Pentest", "Cryptography", "SIEM", "Secure Coding"],
        "technologies": ["Burp Suite", "OWASP ZAP", "Wireshark", "Nmap", "Trivy", "ELK"],
        "projects": ["Web security audit", "Network scanner", "DevSecOps pipeline", "Incident detection lab"],
    },
    "Data Science": {
        "skills": ["Python", "SQL", "Pandas", "Statistics", "Machine Learning", "Visualization", "Scikit-learn", "Data Cleaning"],
        "technologies": ["Python", "Pandas", "Scikit-learn", "Matplotlib", "Power BI", "FastAPI"],
        "projects": ["Prediction model", "Data analytics dashboard", "Recommendation system", "ML API"],
    },
    "Frontend Developer": {
        "skills": ["HTML", "CSS", "JavaScript", "TypeScript", "Vue", "React", "Responsive Design", "Testing", "Accessibility"],
        "technologies": ["Vue", "React", "TypeScript", "Tailwind", "Pinia", "Vite"],
        "projects": ["Component library", "Responsive dashboard", "Portfolio UI", "API-integrated frontend"],
    },
    "Backend Developer": {
        "skills": ["Node.js", "Express", "SQL", "API Design", "Authentication", "Validation", "Testing", "Docker"],
        "technologies": ["Node.js", "Express", "PostgreSQL", "Prisma", "JWT", "Docker"],
        "projects": ["REST API", "Authentication service", "Database-backed platform", "API documentation project"],
    },
    "Full Stack Developer": {
        "skills": ["Frontend", "Backend", "API", "Database", "Authentication", "Deployment", "Testing", "Docker"],
        "technologies": ["Vue", "React", "Node.js", "PostgreSQL", "Docker", "GitHub Actions"],
        "projects": ["Full-stack SaaS app", "Marketplace platform", "Admin dashboard with backend", "Role-based web app"],
    },
    "Cloud Engineer": {
        "skills": ["Linux", "Cloud", "Networking", "Docker", "Kubernetes", "Terraform", "Monitoring", "Security"],
        "technologies": ["AWS", "Azure", "Terraform", "Docker", "Kubernetes", "Prometheus"],
        "projects": ["Cloud deployment", "Infrastructure as code", "Cloud monitoring dashboard", "High availability setup"],
    },
    "AI Engineer": {
        "skills": ["Python", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Model Deployment", "MLOps"],
        "technologies": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "FastAPI", "MLflow"],
        "projects": ["ML prediction API", "NLP classifier", "Computer vision model", "MLOps pipeline"],
    },
    "Mobile Developer": {
        "skills": ["Mobile UI", "API Integration", "State Management", "Authentication", "Offline Mode", "Testing"],
        "technologies": ["Flutter", "React Native", "Kotlin", "Firebase", "Expo", "REST API"],
        "projects": ["Student mobile app", "Portfolio mobile app", "Internship app", "Offline-first mobile project"],
    },
    "UI/UX Designer": {
        "skills": ["Figma", "User Research", "Wireframes", "Prototyping", "Accessibility", "Design System", "Usability Testing"],
        "technologies": ["Figma", "Miro", "Design System", "WCAG", "Prototyping"],
        "projects": ["UX case study", "Design system", "Mobile app prototype", "Dashboard redesign"],
    },
}


def normalize(value: str) -> str:
    return value.strip().lower().replace(".", "").replace("-", " ")


def flatten_profile(profile: dict) -> List[str]:
    fields = ["skills", "projects", "technologies", "badges", "stages"]
    items: List[str] = []
    for field in fields:
        values = profile.get(field, [])
        if isinstance(values, str):
            values = [values]
        items.extend(str(value) for value in values if str(value).strip())
    return items


def load_model():
    if not MODEL_PATH.exists():
        train_model()
    return joblib.load(MODEL_PATH)


class CareerRecommendationModel:
    def __init__(self):
        self.model = load_model()
        self.dataset = pd.read_csv(DATASET_PATH)

    def predict_career_confidence(self, profile_text: str, target_career: str) -> int:
        probabilities = self.model.predict_proba([profile_text])[0]
        classes = list(self.model.classes_)
        if target_career not in classes:
            return 0
        return int(round(probabilities[classes.index(target_career)] * 100))

    def detect_missing_items(self, target_career: str, profile_items: List[str], key: str) -> List[str]:
        requirements = CAREER_REQUIREMENTS[target_career][key]
        normalized_profile = " ".join(normalize(item) for item in profile_items)
        return [item for item in requirements if normalize(item) not in normalized_profile]

    def build_summary(self, target_career: str, score: int, missing_skills: List[str]) -> str:
        if score >= 80:
            level = "Votre profil est solide"
        elif score >= 55:
            level = "Votre profil est prometteur"
        else:
            level = "Votre profil doit être renforcé"

        if missing_skills:
            missing_text = ", ".join(missing_skills[:4])
            return f"{level} pour devenir {target_career}, mais il manque encore {missing_text} dans votre portfolio."
        return f"{level} pour devenir {target_career}. Continuez à documenter vos projets et résultats."

    def recommend(self, profile: dict) -> dict:
        target_career = profile["targetCareer"]
        if target_career not in CAREER_REQUIREMENTS:
            raise ValueError("Unsupported target career")

        profile_items = flatten_profile(profile)
        profile_text = " ".join(profile_items)
        model_score = self.predict_career_confidence(profile_text, target_career)

        missing_skills = self.detect_missing_items(target_career, profile_items, "skills")
        technologies_to_learn = self.detect_missing_items(target_career, profile_items, "technologies")
        recommended_projects = CAREER_REQUIREMENTS[target_career]["projects"]

        coverage = 1 - (len(missing_skills) / max(len(CAREER_REQUIREMENTS[target_career]["skills"]), 1))
        rules_score = int(round(max(0, min(1, coverage)) * 100))
        match_score = int(round((model_score * 0.55) + (rules_score * 0.45)))

        focused_projects = [
            project for project in recommended_projects
            if any(normalize(skill).split()[0] in normalize(project) for skill in missing_skills)
        ] or recommended_projects[:3]

        roadmap = [
            {
                "step": "1",
                "title": "Renforcer les bases",
                "items": missing_skills[:3] or CAREER_REQUIREMENTS[target_career]["skills"][:3],
            },
            {
                "step": "2",
                "title": "Construire un projet preuve",
                "items": focused_projects[:2],
            },
            {
                "step": "3",
                "title": "Publier et documenter",
                "items": ["Ajouter README détaillé", "Publier le code GitHub", "Présenter les résultats dans le portfolio"],
            },
        ]

        return {
            "predictedCareer": self.model.predict([profile_text])[0],
            "matchScore": match_score,
            "missingSkills": missing_skills,
            "recommendedProjects": focused_projects,
            "technologiesToLearn": technologies_to_learn,
            "summary": self.build_summary(target_career, match_score, missing_skills),
            "roadmap": roadmap,
        }
