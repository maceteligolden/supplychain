import Joi from "joi";

import { COMMODITY_UNITS } from "@/config/commodity-units";

export const createCommoditySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  unit: Joi.string()
    .valid(...COMMODITY_UNITS)
    .required(),
  imageFileName: Joi.string().trim().max(255).optional().allow(""),
});

export const updateCommoditySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  unit: Joi.string()
    .valid(...COMMODITY_UNITS)
    .optional(),
  imageFileName: Joi.string().trim().max(255).optional().allow(""),
}).min(1);

export type CreateCommoditySchemaInput = {
  name: string;
  unit: string;
  imageFileName?: string;
};

export type UpdateCommoditySchemaInput = {
  name?: string;
  unit?: string;
  imageFileName?: string;
};
