import Joi from "joi";

const coordinateSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

export const upsertFarmBoundarySchema = Joi.object({
  coordinates: Joi.array().items(coordinateSchema).min(3).required(),
});

export type UpsertFarmBoundarySchemaInput = {
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
};
