import Joi from "joi";

const coordinateSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

const ringSchema = Joi.array().items(coordinateSchema).min(3).max(500);

export const upsertFarmBoundarySchema = Joi.object({
  coordinates: ringSchema.optional(),
  plots: Joi.array().items(ringSchema).min(1).max(20).optional(),
})
  .or("coordinates", "plots")
  .messages({
    "object.missing": "Provide coordinates or plots for the farm boundary",
  });

export type UpsertFarmBoundarySchemaInput = {
  coordinates?: {
    latitude: number;
    longitude: number;
  }[];
  plots?: {
    latitude: number;
    longitude: number;
  }[][];
};
