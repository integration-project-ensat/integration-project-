const portfolioAI =
require("../services/portfolioAI.service");

exports.analyzePortfolio =
async (req,res) => {

  const result =
    await portfolioAI.analyzePortfolio(
      req.body
    );

  res.json(
    JSON.parse(result)
  );
};

exports.improveProject = async (req, res) => {

  const result =
    await portfolioAI.improveProjectDescription(
      req.body.description
    );

  res.json({
    result
  });
};

exports.generateSummary = async (req, res) => {

  const result =
    await portfolioAI.generateProfessionalSummary(
      req.body
    );

  res.json({
    result
  });
};

exports.generateReadme = async (req, res) => {

  const result =
    await portfolioAI.generateReadme(
      req.body
    );

  res.json({
    result
  });
  
};