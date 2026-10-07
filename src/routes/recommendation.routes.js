const express = require("express");

const {
  getPlantRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  deleteRecommendation,
} = require("../controllers/recommendation.controller");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  plantIdSchema,
  recommendationIdSchema,
  recommendationQuerySchema,
  updateRecommendationStatusSchema,
} = require("../validators/recommendation.validator");

const router = express.Router();

router.use(authenticate);

router.get(
  "/plants/:plantId/recommendations",
  validate(
    plantIdSchema,
    "params"
  ),
  validate(
    recommendationQuerySchema,
    "query"
  ),
  getPlantRecommendations
);

router.get(
  "/plants/:plantId/recommendations/:recommendationId",
  validate(
    plantIdSchema.merge(
      recommendationIdSchema
    ),
    "params"
  ),
  getRecommendationById
);

router.patch(
  "/plants/:plantId/recommendations/:recommendationId/status",
  validate(
    plantIdSchema.merge(
      recommendationIdSchema
    ),
    "params"
  ),
  validate(
    updateRecommendationStatusSchema
  ),
  updateRecommendationStatus
);

router.delete(
  "/plants/:plantId/recommendations/:recommendationId",
  validate(
    plantIdSchema.merge(
      recommendationIdSchema
    ),
    "params"
  ),
  deleteRecommendation
);

module.exports = router;