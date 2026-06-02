import Joi from "joi";

import { COMMODITY_UNITS } from "@/config/commodity-units";

const codePattern = /^[A-Z0-9_]+$/;

export const createCommoditySchema = Joi.object({
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
  unit: Joi.string()
    .valid(...COMMODITY_UNITS)
    .required(),
  imageFileName: Joi.string().trim().max(255).optional().allow(""),
});

export const updateCommoditySchema = Joi.object({
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
  unit: Joi.string()
    .valid(...COMMODITY_UNITS)
    .optional(),
  imageFileName: Joi.string().trim().max(255).optional().allow(""),
}).min(1);

export type CreateCommoditySchemaInput = {
  name: string;
  code: string;
  unit: string;
  imageFileName?: string;
};

export type UpdateCommoditySchemaInput = {
  name?: string;
  code?: string;
  unit?: string;
  imageFileName?: string;
};
