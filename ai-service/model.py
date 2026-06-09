from difflib import SequenceMatcher
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


def signal(label, aliases, skills, technologies, projects):
    return {
        "label": label,
        "aliases": aliases,
        "skills": skills,
        "technologies": technologies,
        "projects": projects,
    }


CUSTOM_CAREER_SIGNALS = {
    "software engineering": signal(
        "Software Engineer",
        ["software", "logiciel", "informatique", "ginf", "iid", "developer", "developper", "dev"],
        ["Algorithms", "Data Structures", "OOP", "Software Architecture", "Testing", "Git"],
        ["Java", "Python", "TypeScript", "GitHub", "Docker", "PostgreSQL"],
        ["Clean architecture app", "API with tests", "Documented software project"],
    ),
    "frontend engineering": signal(
        "Frontend Engineer",
        ["frontend", "front", "ui engineer", "vue", "react", "angular", "web ui"],
        ["HTML", "CSS", "JavaScript", "TypeScript", "Responsive Design", "Accessibility", "State Management"],
        ["Vue", "React", "Angular", "TypeScript", "Tailwind", "Vite", "Pinia"],
        ["Responsive frontend app", "Component library", "Accessible dashboard UI"],
    ),
    "backend engineering": signal(
        "Backend Engineer",
        ["backend", "back", "api", "server", "node", "spring", "laravel", "django"],
        ["API Design", "Database Design", "Authentication", "Validation", "Testing", "Scalability"],
        ["Node.js", "Express", "Spring Boot", "Django", "PostgreSQL", "Prisma", "Docker"],
        ["REST API with authentication", "Database-backed service", "API documentation project"],
    ),
    "full stack engineering": signal(
        "Full Stack Engineer",
        ["fullstack", "full stack", "mern", "mean", "web application", "saas"],
        ["Frontend", "Backend", "API Integration", "Database", "Authentication", "Deployment"],
        ["Vue", "React", "Node.js", "PostgreSQL", "Docker", "GitHub Actions"],
        ["Full-stack SaaS app", "Role-based web platform", "Admin dashboard with backend"],
    ),
    "devops platform": signal(
        "DevOps / Platform Engineer",
        ["devops", "platform", "ci", "cd", "pipeline", "deployment", "kubernetes", "docker"],
        ["Linux", "CI/CD", "Containerization", "Monitoring", "Infrastructure as Code", "Automation"],
        ["Docker", "Kubernetes", "GitHub Actions", "Jenkins", "Terraform", "Prometheus", "Grafana"],
        ["CI/CD pipeline", "Kubernetes deployment", "Monitoring dashboard"],
    ),
    "cloud architecture": signal(
        "Cloud Engineer / Cloud Architect",
        ["cloud", "aws", "azure", "gcp", "architect", "serverless", "iaas", "paas"],
        ["Cloud Architecture", "Networking", "Security", "Cost Optimization", "Infrastructure as Code"],
        ["AWS", "Azure", "GCP", "Terraform", "Docker", "Kubernetes", "CloudWatch"],
        ["Cloud deployment architecture", "Infrastructure as code project", "Cost monitoring dashboard"],
    ),
    "cybersecurity": signal(
        "Cybersecurity Engineer",
        ["cyber", "cybersecurity", "security", "securite", "sécurité", "pentest", "soc", "siem", "owasp"],
        ["OWASP", "Network Security", "Pentesting", "Secure Coding", "Threat Modeling", "Incident Response"],
        ["Burp Suite", "OWASP ZAP", "Wireshark", "Nmap", "Trivy", "ELK", "Splunk"],
        ["Web security audit", "DevSecOps pipeline", "SOC incident detection lab"],
    ),
    "data engineering": signal(
        "Data Engineer",
        ["data engineer", "etl", "pipeline", "big data", "spark", "warehouse", "lakehouse"],
        ["ETL", "Data Modeling", "SQL", "Data Pipelines", "Batch Processing", "Data Quality"],
        ["Python", "SQL", "Airflow", "Spark", "Kafka", "dbt", "PostgreSQL"],
        ["ETL data pipeline", "Data warehouse model", "Streaming analytics pipeline"],
    ),
    "data analysis": signal(
        "Data Analyst",
        ["data analyst", "analyst", "analytics", "analyse", "reporting", "dashboard"],
        ["SQL", "Data Cleaning", "Data Visualization", "Statistics", "Business KPIs"],
        ["Power BI", "Tableau", "Excel", "SQL", "Python", "Pandas"],
        ["Business dashboard", "Exploratory data analysis", "KPI reporting project"],
    ),
    "ai engineering": signal(
        "AI Engineer",
        ["ai", "ia", "artificial", "intelligence", "llm", "nlp", "computer vision", "deep learning"],
        ["Python", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Model Deployment"],
        ["PyTorch", "TensorFlow", "Scikit-learn", "FastAPI", "Hugging Face", "MLflow"],
        ["NLP classifier", "Computer vision model", "AI model deployment API"],
    ),
    "mlops": signal(
        "MLOps Engineer",
        ["mlops", "model ops", "ml pipeline", "model deployment", "model monitoring"],
        ["Model Deployment", "CI/CD for ML", "Model Monitoring", "Feature Store", "Automation"],
        ["MLflow", "Docker", "Kubernetes", "FastAPI", "DVC", "GitHub Actions"],
        ["ML deployment pipeline", "Model monitoring dashboard", "Reproducible ML workflow"],
    ),
    "machine learning": signal(
        "Machine Learning Engineer",
        ["machine", "machin", "ml", "learning", "learnng", "lerning", "model", "prediction"],
        ["Python", "Machine Learning", "Statistics", "Model Evaluation", "Data Cleaning", "Feature Engineering"],
        ["Scikit-learn", "Pandas", "NumPy", "Jupyter", "FastAPI", "MLflow"],
        ["Machine learning prediction model", "Dataset analysis notebook", "Model deployment API"],
    ),
    "mobile engineering": signal(
        "Mobile Engineer",
        ["mobile", "android", "ios", "flutter", "react native", "kotlin", "swift"],
        ["Mobile UI", "API Integration", "State Management", "Authentication", "Offline Mode", "Testing"],
        ["Flutter", "React Native", "Kotlin", "Swift", "Firebase", "Expo"],
        ["Mobile internship app", "Offline-first mobile app", "Portfolio mobile application"],
    ),
    "ui ux product design": signal(
        "UI/UX Designer",
        ["ui", "ux", "design", "designer", "figma", "product design", "prototype"],
        ["User Research", "Wireframing", "Prototyping", "Design System", "Usability Testing"],
        ["Figma", "Miro", "Notion", "Design System", "WCAG"],
        ["UX case study", "Interactive prototype", "Dashboard redesign"],
    ),
    "qa testing": signal(
        "QA Engineer",
        ["qa", "quality", "assurance", "tester", "testing", "test", "automation"],
        ["Testing", "Test Automation", "Bug Reporting", "API Testing", "Quality Assurance", "Regression Testing"],
        ["Playwright", "Cypress", "Postman", "Jest", "Selenium"],
        ["Automated test suite", "API testing collection", "Bug tracking workflow"],
    ),
    "embedded iot": signal(
        "Embedded / IoT Engineer",
        ["embedded", "iot", "embarque", "embarqué", "stm32", "microcontroller", "sensor", "capteur"],
        ["C/C++", "Embedded Systems", "Sensors", "Real-time Systems", "Communication Protocols"],
        ["STM32", "Arduino", "Raspberry Pi", "C++", "FreeRTOS", "MQTT"],
        ["IoT sensor platform", "Embedded monitoring device", "MQTT data collection system"],
    ),
    "ar vr": signal(
        "AR/VR Engineer",
        ["ar", "vr", "xr", "augmented", "virtual", "metaverse", "3d"],
        ["3D Interaction", "Computer Graphics", "Performance Optimization", "UX", "Spatial Computing"],
        ["Unity", "C#", "Unreal Engine", "Blender", "ARCore", "ARKit"],
        ["AR product prototype", "VR training simulation", "Interactive 3D portfolio"],
    ),
    "erp crm": signal(
        "ERP / CRM Consultant",
        ["erp", "crm", "sap", "odoo", "salesforce", "business system"],
        ["Business Process Modeling", "Functional Analysis", "Data Migration", "Reporting", "Integration"],
        ["Odoo", "SAP", "Salesforce", "SQL", "Power BI", "Python"],
        ["ERP module customization", "CRM dashboard", "Business workflow automation"],
    ),
    "scrum product management": signal(
        "Product Owner / Scrum Master",
        ["scrum", "agile", "product owner", "po", "project manager", "chef projet", "gestion projet"],
        ["Agile", "Backlog Management", "User Stories", "Roadmap Planning", "Stakeholder Communication"],
        ["Jira", "Trello", "Notion", "Figma", "Miro"],
        ["Agile product roadmap", "User story backlog", "Sprint planning case study"],
    ),
    "technical support": signal(
        "IT Support / Systems Engineer",
        ["support", "helpdesk", "system admin", "sysadmin", "it support", "windows server"],
        ["Troubleshooting", "System Administration", "Networking", "Security Basics", "Documentation"],
        ["Linux", "Windows Server", "Active Directory", "PowerShell", "Docker"],
        ["IT ticketing workflow", "Server monitoring setup", "Internal documentation portal"],
    ),
    "blockchain": signal(
        "Blockchain Developer",
        ["blockchain", "blokchain", "web3", "crypto", "solidity", "smart", "contract"],
        ["Smart Contracts", "Web3", "Security", "Solidity", "Distributed Systems"],
        ["Solidity", "Ethereum", "Hardhat", "Ethers.js", "MetaMask"],
        ["Smart contract app", "Web3 wallet integration", "Blockchain audit demo"],
    ),
    "database": signal(
        "Database Engineer",
        ["database", "databse", "db", "sql", "dba"],
        ["SQL", "Database Design", "Optimization", "Backup Strategy", "Data Modeling"],
        ["PostgreSQL", "MySQL", "Prisma", "MongoDB", "Redis"],
        ["Database optimization case study", "Data modeling project", "Backup and recovery demo"],
    ),
    "industrial engineering": signal(
        "Industrial Engineer",
        ["industrial", "industriel", "industrie", "gind", "gil", "logistique", "supply", "lean", "quality"],
        ["Lean Manufacturing", "Supply Chain", "Process Optimization", "Quality Management", "Operations Research"],
        ["Excel Solver", "Power BI", "Arena Simulation", "Python", "ERP"],
        ["Production line optimization", "Inventory forecasting dashboard", "Lean process improvement study"],
    ),
    "civil engineering": signal(
        "Civil Engineer",
        ["civil", "batiment", "bâtiment", "construction", "structure", "geotech", "géotechnique", "btp"],
        ["Structural Analysis", "Construction Management", "Geotechnics", "CAD Drawing", "Project Planning"],
        ["AutoCAD", "Revit", "Robot Structural Analysis", "Civil 3D", "MS Project"],
        ["Reinforced concrete structure study", "Construction planning dashboard", "Road design case study"],
    ),
    "mechanical engineering": signal(
        "Mechanical Engineer",
        ["mechanical", "mecanique", "mécanique", "catia", "solidworks", "manufacturing", "thermal"],
        ["CAD Design", "Mechanical Analysis", "Thermodynamics", "Manufacturing", "Maintenance"],
        ["SolidWorks", "CATIA", "ANSYS", "MATLAB", "AutoCAD"],
        ["Mechanical part design", "Finite element analysis", "Maintenance optimization project"],
    ),
    "electrical engineering": signal(
        "Electrical Engineer",
        ["electrical", "electrique", "électrique", "electricite", "électricité", "power", "energy"],
        ["Electrical Circuits", "Power Systems", "Protection", "Energy Efficiency", "Instrumentation"],
        ["MATLAB Simulink", "ETAP", "AutoCAD Electrical", "Proteus", "Arduino"],
        ["Power distribution study", "Energy consumption dashboard", "Electrical protection simulation"],
    ),
    "electronics engineering": signal(
        "Electronics Engineer",
        ["electronics", "electronique", "électronique", "embedded", "microcontroller", "fpga", "pcb"],
        ["Embedded Systems", "Circuit Design", "Signal Processing", "Microcontrollers", "PCB Design"],
        ["Arduino", "STM32", "Proteus", "KiCad", "VHDL", "MATLAB"],
        ["Embedded sensor system", "PCB design project", "Signal processing prototype"],
    ),
    "telecom engineering": signal(
        "Telecom Engineer",
        ["telecom", "télécom", "telecommunication", "gtr", "gstr", "radio", "5g", "fiber"],
        ["Networking", "Wireless Communication", "Signal Processing", "Routing", "Network Security"],
        ["Cisco Packet Tracer", "Wireshark", "MATLAB", "NS3", "Linux"],
        ["5G network simulation", "Fiber network planning", "Secure routing lab"],
    ),
    "automation control": signal(
        "Automation Engineer",
        ["automation", "automatique", "control", "controle", "contrôle", "plc", "scada"],
        ["Control Systems", "PLC Programming", "SCADA", "Instrumentation", "Industrial Automation"],
        ["TIA Portal", "Siemens PLC", "LabVIEW", "MATLAB Simulink", "SCADA"],
        ["PLC automation line", "SCADA monitoring system", "Control loop simulation"],
    ),
    "robotics": signal(
        "Robotics Engineer",
        ["robotics", "robotic", "robot", "iot", "embedded", "arduino"],
        ["Python", "C++", "Embedded Systems", "Sensors", "Control Systems", "ROS"],
        ["ROS", "Arduino", "Raspberry Pi", "OpenCV", "C++"],
        ["Robot navigation prototype", "Sensor data dashboard", "Computer vision robot demo"],
    ),
    "network engineering": signal(
        "Network Engineer",
        ["network", "networking", "reseau", "réseau", "cisco", "system", "systeme", "système"],
        ["Networking", "TCP/IP", "Routing", "Switching", "Linux", "Security"],
        ["Cisco Packet Tracer", "Wireshark", "Linux", "Nmap"],
        ["Network monitoring lab", "Secure LAN architecture", "Packet analysis report"],
    ),
    "business intelligence": signal(
        "BI Engineer",
        ["business", "bi", "intelligence", "analyst", "analytics", "decisionnel", "décisionnel"],
        ["SQL", "Data Analysis", "Dashboarding", "KPIs", "Data Visualization"],
        ["Power BI", "SQL", "Excel", "Tableau", "Python"],
        ["BI dashboard", "Sales analytics report", "KPI monitoring project"],
    ),
    "sre": signal(
        "Site Reliability Engineer",
        ["sre", "reliability", "site", "ops", "observability"],
        ["Linux", "Monitoring", "Incident Response", "Automation", "Cloud", "SLO/SLA"],
        ["Prometheus", "Grafana", "Docker", "Kubernetes", "Terraform"],
        ["Incident monitoring dashboard", "Auto-healing deployment", "SLO reporting project"],
    ),
    "energy engineering": signal(
        "Energy Engineer",
        ["energy", "energie", "énergie", "renewable", "renouvelable", "solar", "wind", "smartgrid"],
        ["Energy Efficiency", "Renewable Energy", "Electrical Systems", "Energy Audit", "Sustainability"],
        ["PVsyst", "MATLAB", "HOMER", "Power BI", "Excel"],
        ["Solar sizing study", "Energy audit dashboard", "Renewable energy optimization project"],
    ),
    "environment engineering": signal(
        "Environmental Engineer",
        ["environment", "environnement", "water", "eau", "waste", "pollution", "hse"],
        ["Environmental Impact", "Water Treatment", "Waste Management", "HSE", "Sustainability"],
        ["QGIS", "Excel", "Power BI", "EPANET", "AutoCAD"],
        ["Water treatment study", "Environmental impact dashboard", "Waste optimization project"],
    ),
    "chemical process": signal(
        "Chemical Process Engineer",
        ["chemical", "chimie", "chimique", "process", "procédé", "procede", "petrochemical"],
        ["Process Design", "Mass Balance", "Thermodynamics", "Safety", "Quality Control"],
        ["Aspen HYSYS", "MATLAB", "Excel", "Python"],
        ["Process simulation project", "Mass balance case study", "Quality control dashboard"],
    ),
    "materials engineering": signal(
        "Materials Engineer",
        ["materials", "materiaux", "matériaux", "metallurgy", "metallurgie", "composite"],
        ["Material Characterization", "Mechanical Testing", "Failure Analysis", "Quality Control"],
        ["SolidWorks", "ANSYS", "MATLAB", "Excel"],
        ["Material selection study", "Failure analysis report", "Composite design project"],
    ),
    "biomedical engineering": signal(
        "Biomedical Engineer",
        ["biomedical", "biomédical", "biomedicale", "medical", "health", "santé", "sante"],
        ["Medical Instrumentation", "Signal Processing", "Regulatory Basics", "Data Analysis", "Biomedical Sensors"],
        ["MATLAB", "Python", "Arduino", "LabVIEW", "Power BI"],
        ["Biomedical signal analysis", "Medical device prototype", "Health data dashboard"],
    ),
    "aerospace engineering": signal(
        "Aerospace Engineer",
        ["aerospace", "aeronautic", "aéronautique", "aero", "avion", "flight"],
        ["Aerodynamics", "Flight Mechanics", "CAD", "Simulation", "Control Systems"],
        ["CATIA", "ANSYS", "MATLAB", "Simulink"],
        ["Wing design simulation", "Flight control model", "Aerodynamic analysis project"],
    ),
    "automotive engineering": signal(
        "Automotive Engineer",
        ["automotive", "automobile", "vehicle", "vehicule", "véhicule", "car"],
        ["Vehicle Systems", "CAD Design", "Embedded Systems", "Testing", "Manufacturing"],
        ["CATIA", "MATLAB Simulink", "CANoe", "SolidWorks"],
        ["Vehicle subsystem model", "Embedded automotive prototype", "Maintenance analytics dashboard"],
    ),
    "finance engineering": signal(
        "Financial Engineer",
        ["finance", "fintech", "risk", "trading", "quant", "actuarial"],
        ["Statistics", "Risk Modeling", "Python", "Financial Analysis", "Optimization"],
        ["Python", "Pandas", "NumPy", "Excel", "Power BI"],
        ["Risk analysis model", "Trading analytics dashboard", "Portfolio optimization project"],
    ),
    "agronomy engineering": signal(
        "Agronomy Engineer",
        ["agronomy", "agronomie", "agriculture", "food", "alimentaire", "agri"],
        ["Agricultural Systems", "Food Quality", "Sustainability", "Data Analysis", "Process Control"],
        ["QGIS", "Excel", "Power BI", "Python"],
        ["Smart agriculture dashboard", "Food quality control study", "Crop data analysis project"],
    ),
    "mining geology": signal(
        "Mining / Geology Engineer",
        ["mining", "mine", "mines", "geology", "geologie", "géologie", "geotech", "geotechnique"],
        ["Geotechnics", "Geology Mapping", "Risk Analysis", "Mining Operations", "Data Analysis"],
        ["QGIS", "AutoCAD", "Surpac", "Excel", "Python"],
        ["Mining site analysis", "Geological mapping project", "Geotechnical risk dashboard"],
    ),
    "marine engineering": signal(
        "Marine / Naval Engineer",
        ["marine", "naval", "ship", "offshore", "port", "maritime"],
        ["Fluid Mechanics", "Naval Architecture", "Maintenance", "Safety", "CAD Design"],
        ["AutoCAD", "ANSYS", "SolidWorks", "MATLAB", "Excel"],
        ["Ship stability study", "Marine maintenance dashboard", "Offshore structure analysis"],
    ),
    "quality hse": signal(
        "Quality / HSE Engineer",
        ["hse", "qhse", "quality", "qualite", "qualité", "safety", "securite", "iso"],
        ["Quality Management", "Risk Assessment", "ISO Standards", "Audit", "Safety Management"],
        ["Excel", "Power BI", "ISO 9001", "ISO 45001", "Audit checklist tools"],
        ["Quality audit dashboard", "Risk assessment matrix", "HSE incident tracking system"],
    ),
    "maintenance engineering": signal(
        "Maintenance Engineer",
        ["maintenance", "reliability", "gmao", "equipment", "machine"],
        ["Preventive Maintenance", "Reliability", "Root Cause Analysis", "Planning", "KPI Tracking"],
        ["GMAO/CMMS", "Excel", "Power BI", "Python", "SolidWorks"],
        ["Preventive maintenance plan", "Equipment failure analysis", "Maintenance KPI dashboard"],
    ),
    "systems engineering": signal(
        "Systems Engineer",
        ["systems", "systemes", "systèmes", "architecture systeme", "integration", "middleware"],
        ["Systems Architecture", "Integration", "Requirements Analysis", "Testing", "Documentation"],
        ["Linux", "Docker", "UML", "GitHub", "CI/CD"],
        ["System architecture documentation", "Integration test platform", "Microservices proof of concept"],
    ),
}


GENERAL_CUSTOM_REQUIREMENTS = {
    "skills": ["Git", "Problem Solving", "Technical Documentation", "Portfolio Project", "Communication"],
    "technologies": ["GitHub", "Excel", "Power BI", "Python", "Project documentation"],
    "projects": ["Portfolio project for the target role", "Documented GitHub project", "Real-world case study"],
}


def normalize(value: str) -> str:
    accents = str.maketrans("àâäéèêëîïôöùûüç", "aaaeeeeiioouuuc")
    return value.strip().lower().translate(accents).replace(".", "").replace("-", " ")


def tokenize(value: str) -> List[str]:
    normalized = normalize(value)
    for separator in ["/", "_", ",", ";", ":", "(", ")"]:
        normalized = normalized.replace(separator, " ")
    return [token for token in normalized.split() if token]


def is_close_token(token: str, alias: str) -> bool:
    alias = normalize(alias)
    if token == alias:
        return True
    if len(token) >= 4 and len(alias) >= 4 and alias in token:
        return True
    if len(token) < 4 or len(alias) < 4:
        return False
    return SequenceMatcher(None, token, alias).ratio() >= 0.82


def signal_matches(target_career: str, signal_data: Dict[str, List[str]]) -> bool:
    normalized_target = normalize(target_career)
    target_tokens = tokenize(target_career)

    for alias in signal_data["aliases"]:
        normalized_alias = normalize(alias)
        if " " in normalized_alias:
            if normalized_alias in normalized_target:
                return True
            continue
        if any(is_close_token(token, normalized_alias) for token in target_tokens):
            return True

    return False


def unique(values: List[str]) -> List[str]:
    return list(dict.fromkeys(value for value in values if value))


def is_known_career(target_career: str) -> bool:
    return target_career in CAREER_REQUIREMENTS


def infer_custom_requirements(target_career: str) -> Dict[str, List[str]]:
    inferred = {"skills": [], "technologies": [], "projects": []}
    matched_domains = []
    corrected_labels = []

    for domain, requirements in CUSTOM_CAREER_SIGNALS.items():
        if signal_matches(target_career, requirements):
            matched_domains.append(domain)
            corrected_labels.append(requirements["label"])
            inferred["skills"].extend(requirements["skills"])
            inferred["technologies"].extend(requirements["technologies"])
            inferred["projects"].extend(requirements["projects"])

    if not matched_domains:
        inferred["skills"].extend([
            "Domain Research",
            "Core Engineering Principles",
            "Problem Solving",
            "Technical Documentation",
            "Project Management",
        ])
        inferred["technologies"].extend([
            "Python",
            "Excel",
            "Power BI",
            "GitHub",
            "Domain-specific simulation tool",
        ])
        inferred["projects"].extend([
            f"{target_career} domain research project",
            f"{target_career} practical prototype",
            f"{target_career} case study with measurable results",
        ])

    inferred["skills"].extend(GENERAL_CUSTOM_REQUIREMENTS["skills"])
    inferred["technologies"].extend(GENERAL_CUSTOM_REQUIREMENTS["technologies"])
    inferred["projects"].extend([
        f"{target_career} portfolio project",
        f"{target_career} practical case study",
        f"{target_career} GitHub proof project",
    ])

    return {
        "skills": unique(inferred["skills"]),
        "technologies": unique(inferred["technologies"]),
        "projects": unique(inferred["projects"]),
        "matchedDomains": matched_domains,
        "correctedCareer": " / ".join(unique(corrected_labels)) or target_career,
    }


def get_requirements(target_career: str) -> Dict[str, List[str]]:
    if is_known_career(target_career):
        requirements = CAREER_REQUIREMENTS[target_career]
        return {
            **requirements,
            "matchedDomains": [target_career],
            "correctedCareer": target_career,
        }
    return infer_custom_requirements(target_career)


def flatten_profile(profile: dict) -> List[str]:
    fields = ["skills", "projects", "technologies", "badges", "stages"]
    items: List[str] = []
    for field in fields:
        values = profile.get(field, [])
        if isinstance(values, str):
            values = [values]
        items.extend(str(value) for value in values if str(value).strip())
    student = profile.get("student", {})
    if isinstance(student, dict):
        items.extend(
            str(value)
            for value in [
                student.get("filiere"),
                student.get("anneeUniversitaire"),
                student.get("objectifPro"),
                student.get("score"),
            ]
            if str(value or "").strip()
        )
    return items


def compute_alignment_bonus(profile: dict, target_career: str, corrected_career: str) -> int:
    student = profile.get("student", {}) if isinstance(profile.get("student"), dict) else {}
    alignment_text = " ".join(
        normalize(str(value))
        for value in [
            student.get("filiere"),
            student.get("objectifPro"),
            corrected_career,
            target_career,
        ]
        if str(value or "").strip()
    )

    bonus = 0
    target_tokens = tokenize(corrected_career or target_career)
    for token in target_tokens:
        if token and token in alignment_text:
            bonus += 6

    if "cyber" in alignment_text and "cyber" in " ".join(target_tokens):
        bonus += 10
    if "data" in alignment_text and any(token in {"data", "science", "analyst", "ml", "ai"} for token in target_tokens):
        bonus += 10
    if any(token in alignment_text for token in ["devops", "cloud", "docker", "kubernetes"]) and any(
        token in {"devops", "cloud"} for token in target_tokens
    ):
        bonus += 10
    if any(token in alignment_text for token in ["web", "frontend", "backend", "full", "stack"]) and any(
        token in {"web", "frontend", "backend", "full", "stack"} for token in target_tokens
    ):
        bonus += 8

    return min(bonus, 25)


def compute_profile_richness(profile: dict) -> int:
    total_items = sum(
        len(profile.get(field, [])) if isinstance(profile.get(field, []), list) else 0
        for field in ["skills", "projects", "technologies", "badges", "stages"]
    )
    return min(total_items * 2, 20)

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
            return int(round(max(probabilities) * 100))
        return int(round(probabilities[classes.index(target_career)] * 100))

    def detect_missing_items(self, requirements: Dict[str, List[str]], profile_items: List[str], key: str) -> List[str]:
        normalized_profile = " ".join(normalize(item) for item in profile_items)
        return [item for item in requirements[key] if normalize(item) not in normalized_profile]

    def build_summary(self, target_career: str, corrected_career: str, score: int, missing_skills: List[str], is_custom: bool) -> str:
        if score >= 80:
            level = "Votre profil est solide"
        elif score >= 55:
            level = "Votre profil est prometteur"
        else:
            level = "Votre profil doit être renforcé"

        target_text = f"{corrected_career} ({target_career})" if is_custom and corrected_career != target_career else target_career

        if missing_skills:
            missing_text = ", ".join(missing_skills[:4])
            return f"{level} pour viser {target_text}, mais il manque encore {missing_text} dans votre portfolio."
        return f"{level} pour viser {target_text}. Continuez à documenter vos projets et résultats."

    def recommend(self, profile: dict) -> dict:
        target_career = profile["targetCareer"].strip()
        profile_items = flatten_profile(profile)
        profile_text = " ".join(profile_items)
        requirements = get_requirements(target_career)
        custom_target = not is_known_career(target_career)
        corrected_career = requirements.get("correctedCareer", target_career)
        model_score = self.predict_career_confidence(profile_text, corrected_career)

        missing_skills = self.detect_missing_items(requirements, profile_items, "skills")
        technologies_to_learn = self.detect_missing_items(requirements, profile_items, "technologies")
        recommended_projects = requirements["projects"]

        coverage = 1 - (len(missing_skills) / max(len(requirements["skills"]), 1))
        rules_score = int(round(max(0, min(1, coverage)) * 100))
        alignment_bonus = compute_alignment_bonus(profile, target_career, corrected_career)
        profile_richness = compute_profile_richness(profile)
        match_score = int(
            round(
                (model_score * 0.2)
                + (rules_score * 0.55)
                + alignment_bonus
                + profile_richness
            )
        )
        match_score = max(0, min(100, match_score))
        match_score = int(round((model_score * 0.25) + (rules_score * 0.75)))

        roadmap = [
            {
                "step": "1",
                "title": "Renforcer les bases",
                "items": missing_skills[:3] or requirements["skills"][:3],
            },
            {
                "step": "2",
                "title": "Construire un projet preuve",
                "items": recommended_projects[:2],
            },
            {
                "step": "3",
                "title": "Publier et documenter",
                "items": ["Ajouter README détaillé", "Publier le code GitHub", "Présenter les résultats dans le portfolio"],
            },
        ]

        return {
            "predictedCareer": self.model.predict([profile_text])[0],
            "targetCareer": target_career,
            "correctedCareer": corrected_career,
            "analysisMode": "custom" if custom_target else "trained",
            "matchedDomains": requirements.get("matchedDomains", []),
            "matchScore": match_score,
            "debug": {
                "modelScore": model_score,
                "rulesScore": rules_score,
                "alignmentBonus": alignment_bonus,
                "profileRichness": profile_richness,
            },
            "missingSkills": missing_skills,
            "recommendedProjects": recommended_projects[:3],
            "technologiesToLearn": technologies_to_learn,
            "summary": self.build_summary(target_career, corrected_career, match_score, missing_skills, custom_target),
            "roadmap": roadmap,
        }
