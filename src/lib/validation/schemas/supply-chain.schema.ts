import Joi from "joi";

import { SUPPLY_CHAIN_STATUSES } from "@/config/supply-chain-status";

export const createSupplyChainSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string()
    .valid(...SUPPLY_CHAIN_STATUSES)
    .required(),
  commodityId: Joi.string().trim().optional(),
  allocations: Joi.array()
    .items(
      Joi.object({
        batchId: Joi.string().trim().required(),
        quantity: Joi.number().positive().required(),
      }),
    )
    .optional(),
});

export const updateSupplyChainSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string()
    .valid(...SUPPLY_CHAIN_STATUSES)
    .optional(),
  commodityId: Joi.string().trim().optional(),
}).min(1);

export type CreateSupplyChainSchemaInput = {
  name: string;
  description?: string;
  status: string;
  commodityId?: string;
  allocations?: {
    batchId: string;
    quantity: number;
  }[];
};

export type UpdateSupplyChainSchemaInput = {
  name?: string;
  description?: string;
  status?: string;
  commodityId?: string;
};
