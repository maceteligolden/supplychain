import Joi from "joi";

export const createBatchSchema = Joi.object({
  farmId: Joi.string().trim().required(),
  harvestDate: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Harvest date must be YYYY-MM-DD",
    }),
  quantity: Joi.number().positive().required(),
  batchNumber: Joi.string().trim().uppercase().min(2).max(80).optional(),
});

export const updateBatchSchema = Joi.object({
  harvestDate: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      "string.pattern.base": "Harvest date must be YYYY-MM-DD",
    }),
  quantity: Joi.number().positive().optional(),
}).min(1);

export type CreateBatchSchemaInput = {
  farmId: string;
  harvestDate: string;
  quantity: number;
  batchNumber?: string;
};

export type UpdateBatchSchemaInput = {
  harvestDate?: string;
  quantity?: number;
};
