const portfolioAnalyzerService = require(
  "../services/portfolioAnalyzer.service"
);

const analyzePortfolio = async (req, res, next) => {
  try {
    const result =
      await portfolioAnalyzerService.analyzePortfolio(
        req.params.etudiantId
      );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzePortfolio
};