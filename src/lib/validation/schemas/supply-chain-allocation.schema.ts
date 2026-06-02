import Joi from "joi";

export const supplyChainAllocationItemSchema = Joi.object({
  batchId: Joi.string().trim().required(),
  quantity: Joi.number().positive().required(),
});

export const syncSupplyChainAllocationsSchema = Joi.object({
  allocations: Joi.array().items(supplyChainAllocationItemSchema).required(),
});

export type SyncSupplyChainAllocationsSchemaInput = {
  allocations: {
    batchId: string;
    quantity: number;
  }[];
};
