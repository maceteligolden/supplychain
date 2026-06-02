import Joi from "joi";

import { SUPPLY_CHAIN_EVENT_TYPES } from "@/config/supply-chain-event-types";

export const createSupplyChainEventSchema = Joi.object({
  type: Joi.string()
    .valid(...SUPPLY_CHAIN_EVENT_TYPES)
    .required(),
  occurredAt: Joi.string().isoDate().required(),
  actorId: Joi.string().trim().required(),
  notes: Joi.string().trim().max(1000).optional().allow(""),
});

export const updateSupplyChainEventSchema = Joi.object({
  notes: Joi.string().trim().max(1000).optional().allow(""),
  actorId: Joi.string().trim().optional(),
}).min(1);

export type CreateSupplyChainEventSchemaInput = {
  type: string;
  occurredAt: string;
  actorId: string;
  notes?: string;
};

export type UpdateSupplyChainEventSchemaInput = {
  notes?: string;
  actorId?: string;
};
