import Joi from "joi";

const codePattern = /^[A-Z0-9_]+$/;

const locationSchema = Joi.object({
  country: Joi.string().trim().min(2).max(100).required(),
  region: Joi.string().trim().min(2).max(100).required(),
  city: Joi.string().trim().min(2).max(100).required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

export const createFarmSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(codePattern)
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.pattern.base":
        "Code must contain only uppercase letters, numbers, and underscores",
    }),
  commodityId: Joi.string().trim().required(),
  location: locationSchema.required(),
});

export const updateFarmSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(codePattern)
    .min(2)
    .max(50)
    .optional()
    .messages({
      "string.pattern.base":
        "Code must contain only uppercase letters, numbers, and underscores",
    }),
  commodityId: Joi.string().trim().optional(),
  location: locationSchema.optional(),
}).min(1);

export type CreateFarmSchemaInput = {
  name: string;
  code: string;
  commodityId: string;
  location: {
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
};

export type UpdateFarmSchemaInput = {
  name?: string;
  code?: string;
  commodityId?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
};
