require("dotenv").config();

const {
  generateProfessionalSummary
} = require(
  "./src/services/portfolioAI.service"
);

async function test() {

  const response =
    await generateProfessionalSummary({
      nom: "Khadija",

      skills: [
        "Vue.js",
        "Node.js",
        "PostgreSQL"
      ],

      projects: [
        "Portfolio Platform"
      ]
    });

  console.log(response);
}

test();