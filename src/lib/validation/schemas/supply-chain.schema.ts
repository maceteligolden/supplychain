import Joi from "joi";

import { SUPPLY_CHAIN_STATUSES } from "@/config/supply-chain-status";

const codePattern = /^[A-Z0-9_]+$/;

export const createSupplyChainSchema = Joi.object({
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
  description: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string()
    .valid(...SUPPLY_CHAIN_STATUSES)
    .required(),
});

export const updateSupplyChainSchema = Joi.object({
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
  description: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string()
    .valid(...SUPPLY_CHAIN_STATUSES)
    .optional(),
}).min(1);

export type CreateSupplyChainSchemaInput = {
  name: string;
  code: string;
  description?: string;
  status: string;
};

export type UpdateSupplyChainSchemaInput = {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
};
