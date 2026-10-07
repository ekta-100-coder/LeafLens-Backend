const mongoose = require("mongoose");

const Recommendation = require("../../models/Recommendation");
const Plant = require("../../models/Plant");

const ApiError = require("../../utils/ApiError");

const validateObjectId = (
  id,
  fieldName = "ID"
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(
      400,
      `Invalid ${fieldName}.`
    );
  }
};

const verifyPlantOwnership = async (
  userId,
  plantId
) => {
  validateObjectId(
    plantId,
    "plant ID"
  );

  const plant = await Plant.findOne({
    _id: plantId,
    user: userId,
  });

  if (!plant) {
    throw new ApiError(
      404,
      "Plant not found."
    );
  }

  return plant;
};

const createRecommendation = async (
  userId,
  recommendationData
) => {
  await verifyPlantOwnership(
    userId,
    recommendationData.plant
  );

  const recommendation =
    await Recommendation.create({
      ...recommendationData,
      user: userId,
    });

  return recommendation;
};

const getPlantRecommendations = async (
  userId,
  plantId,
  options = {}
) => {
  await verifyPlantOwnership(
    userId,
    plantId
  );

  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    activeOnly = false,
  } = options;

  const skip = (page - 1) * limit;

  const filter = {
    plant: plantId,
    user: userId,
  };

  if (activeOnly) {
    filter.status = "active";
  } else if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (priority) {
    filter.priority = priority;
  }

  const [recommendations, total] =
    await Promise.all([
      Recommendation.find(filter)
        .sort({
          priority: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Recommendation.countDocuments(filter),
    ]);

  return {
    recommendations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
      hasNextPage:
        page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getRecommendationById = async (
  userId,
  plantId,
  recommendationId
) => {
  validateObjectId(
    recommendationId,
    "recommendation ID"
  );

  await verifyPlantOwnership(
    userId,
    plantId
  );

  const recommendation =
    await Recommendation.findOne({
      _id: recommendationId,
      plant: plantId,
      user: userId,
    });

  if (!recommendation) {
    throw new ApiError(
      404,
      "Recommendation not found."
    );
  }

  return recommendation;
};

const updateRecommendationStatus =
  async (
    userId,
    plantId,
    recommendationId,
    status
  ) => {
    validateObjectId(
      recommendationId,
      "recommendation ID"
    );

    await verifyPlantOwnership(
      userId,
      plantId
    );

    const updateData = {
      status,
    };

    if (status === "completed") {
      updateData.completedAt =
        new Date();
      updateData.dismissedAt = null;
    }

    if (status === "dismissed") {
      updateData.dismissedAt =
        new Date();
      updateData.completedAt = null;
    }

    if (status === "active") {
      updateData.completedAt = null;
      updateData.dismissedAt = null;
    }

    const recommendation =
      await Recommendation.findOneAndUpdate(
        {
          _id: recommendationId,
          plant: plantId,
          user: userId,
        },
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!recommendation) {
      throw new ApiError(
        404,
        "Recommendation not found."
      );
    }

    return recommendation;
  };

const deleteRecommendation = async (
  userId,
  plantId,
  recommendationId
) => {
  validateObjectId(
    recommendationId,
    "recommendation ID"
  );

  await verifyPlantOwnership(
    userId,
    plantId
  );

  const recommendation =
    await Recommendation.findOneAndDelete({
      _id: recommendationId,
      plant: plantId,
      user: userId,
    });

  if (!recommendation) {
    throw new ApiError(
      404,
      "Recommendation not found."
    );
  }

  return recommendation;
};

const expireRecommendations = async (
  now = new Date()
) => {
  const result =
    await Recommendation.updateMany(
      {
        status: "active",
        expiresAt: {
          $ne: null,
          $lte: now,
        },
      },
      {
        $set: {
          status: "expired",
        },
      }
    );

  return {
    modifiedCount:
      result.modifiedCount,
  };
};

module.exports = {
  createRecommendation,
  getPlantRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  deleteRecommendation,
  expireRecommendations,
};