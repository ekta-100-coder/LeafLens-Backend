const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const recommendationService = require("../services/ai/recommendation.service");

const getPlantRecommendations =
  asyncHandler(async (req, res) => {
    const page = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          req.query.limit,
          10
        ) || 20,
        1
      ),
      100
    );

    const result =
      await recommendationService.getPlantRecommendations(
        req.user._id,
        req.params.plantId,
        {
          page,
          limit,
          status: req.query.status,
          category: req.query.category,
          priority: req.query.priority,
          activeOnly:
            req.query.activeOnly ===
            "true",
        }
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Recommendations retrieved successfully.",
        {
          recommendations:
            result.recommendations.map(
              (recommendation) =>
                recommendation.toSafeObject()
            ),
          pagination:
            result.pagination,
        }
      )
    );
  });

const getRecommendationById =
  asyncHandler(async (req, res) => {
    const recommendation =
      await recommendationService.getRecommendationById(
        req.user._id,
        req.params.plantId,
        req.params.recommendationId
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Recommendation retrieved successfully.",
        {
          recommendation:
            recommendation.toSafeObject(),
        }
      )
    );
  });

const updateRecommendationStatus =
  asyncHandler(async (req, res) => {
    const recommendation =
      await recommendationService.updateRecommendationStatus(
        req.user._id,
        req.params.plantId,
        req.params.recommendationId,
        req.body.status
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Recommendation status updated successfully.",
        {
          recommendation:
            recommendation.toSafeObject(),
        }
      )
    );
  });

const deleteRecommendation =
  asyncHandler(async (req, res) => {
    await recommendationService.deleteRecommendation(
      req.user._id,
      req.params.plantId,
      req.params.recommendationId
    );

    res.status(200).json(
      new ApiResponse(
        200,
        "Recommendation deleted successfully.",
        null
      )
    );
  });

module.exports = {
  getPlantRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  deleteRecommendation,
};