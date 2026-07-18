import Joi from "joi";

import { ACTOR_STATUSES, ACTOR_TYPES } from "@/config/actor-types";

const actorAddressSchema = Joi.object({
  line1: Joi.string().trim().max(200).optional().allow(""),
  city: Joi.string().trim().min(1).max(100).required(),
  region: Joi.string().trim().min(1).max(100).required(),
  country: Joi.string().trim().min(1).max(100).required(),
});

export const createActorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  type: Joi.string()
    .valid(...ACTOR_TYPES)
    .required(),
  address: actorAddressSchema.required(),
  status: Joi.string()
    .valid(...ACTOR_STATUSES)
    .required(),
});

export const updateActorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  type: Joi.string()
    .valid(...ACTOR_TYPES)
    .optional(),
  address: actorAddressSchema.optional(),
  status: Joi.string()
    .valid(...ACTOR_STATUSES)
    .optional(),
}).min(1);

export type CreateActorSchemaInput = {
  name: string;
  type: string;
  address: {
    line1?: string;
    city: string;
    region: string;
    country: string;
  };
  status: string;
};

export type UpdateActorSchemaInput = {
  name?: string;
  type?: string;
  address?: {
    line1?: string;
    city: string;
    region: string;
    country: string;
  };
  status?: string;
};
