const Groq = require("groq-sdk");

let groq = null;

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error("GROQ_API_KEY manquante");
    error.statusCode = 503;
    throw error;
  }

  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  return groq;
}

async function askAI(prompt) {
  const client = getGroqClient();

  const completion =
    await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4
    });

  return completion.choices[0].message.content;
}

async function analyzePortfolio(portfolioData) {

  const prompt = `
Vous êtes un recruteur expert.

Analysez ce portfolio d'étudiant.

le score doit etre entre 0 et 100.

Retournez uniquement un JSON valide.
{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "professionalFeedback": ""
}

Portfolio:

${JSON.stringify(portfolioData, null, 2)}
`;

  const result = await askAI(prompt);

return result
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();
}

async function improveProjectDescription(
  description
) {

  const prompt = `
Réécrivez la description de projet suivante de manière professionnelle.

Règles :
- Utiliser un ton professionnel
- Entre 3 et 5 phrases
- Adaptée à un portfolio
- Conserver le sens original
Description:

${description}
`;

  return await askAI(prompt);
}

async function generateProfessionalSummary(profileData) {

  const prompt = `
Générez un résumé professionnel pour un portfolio.

Rédigez un seul paragraphe professionnel.

Student:

${JSON.stringify(profileData, null, 2)}
`;

  return await askAI(prompt);
}

async function improveInternshipDescription(
  description
) {

  const prompt = `
Réécrivez cette description de stage de manière professionnelle.

Description:

${description}
`;

  return await askAI(prompt);
}

async function generateReadme(
  projectData
) {

  const prompt = `
Générez un fichier README GitHub professionnel.

Project:

${JSON.stringify(projectData, null, 2)}
`;
  
  return await askAI(prompt);
}

module.exports = {
  askAI,
  analyzePortfolio,
  improveProjectDescription,
  improveInternshipDescription,
  generateProfessionalSummary,
  generateReadme
};
