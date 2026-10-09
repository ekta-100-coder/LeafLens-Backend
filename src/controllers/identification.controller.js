const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const {
  identifyPlant,
  getIdentificationById,
  getIdentificationHistory,
} = require("../services/ai/identification.service");

const identifyPlantController =
  asyncHandler(async (req, res) => {
    const {
      plantId,
      imageId,
    } = req.body;

    const identification =
      await identifyPlant({
        userId: req.user._id,
        plantId,
        imageId,
      });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          identification.toSafeObject(),
          "Plant identified successfully."
        )
      );
  });

const getIdentificationController =
  asyncHandler(async (req, res) => {
    const {
      plantId,
      identificationId,
    } = req.params;

    const identification =
      await getIdentificationById(
        req.user._id,
        plantId,
        identificationId
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          identification.toSafeObject(),
          "Identification result retrieved successfully."
        )
      );
  });

const getIdentificationHistoryController =
  asyncHandler(async (req, res) => {
    const { plantId } =
      req.params;

    const history =
      await getIdentificationHistory(
        req.user._id,
        plantId,
        req.query
      );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            identifications:
              history.identifications.map(
                (identification) =>
                  identification.toSafeObject()
              ),
            pagination:
              history.pagination,
          },
          "Identification history retrieved successfully."
        )
      );
  });

module.exports = {
  identifyPlantController,
  getIdentificationController,
  getIdentificationHistoryController,
};