import Joi from "joi";

export const createBatchAllocationSchema = Joi.object({
  batchId: Joi.string().trim().required(),
  supplyChainId: Joi.string().trim().required(),
  quantity: Joi.number().positive().required(),
  allocatedAt: Joi.string().trim().isoDate().optional(),
});

export const updateBatchAllocationSchema = Joi.object({
  quantity: Joi.number().positive().optional(),
  allocatedAt: Joi.string().trim().isoDate().optional(),
}).min(1);

export type CreateBatchAllocationSchemaInput = {
  batchId: string;
  supplyChainId: string;
  quantity: number;
  allocatedAt?: string;
};

export type UpdateBatchAllocationSchemaInput = {
  quantity?: number;
  allocatedAt?: string;
};
