import Joi from "joi";

import { FARM_STATUSES } from "@/config/farm-status";

const ownerSchema = Joi.object({
  firstName: Joi.string().trim().max(100).allow("").default(""),
  lastName: Joi.string().trim().max(100).allow("").default(""),
  phone: Joi.string().trim().max(30).allow("").default(""),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .allow("")
    .default(""),
});

const locationSchema = Joi.object({
  country: Joi.string().trim().max(100).allow("").default(""),
  region: Joi.string().trim().max(100).allow("").default(""),
  city: Joi.string().trim().max(100).allow("").default(""),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

export const createFarmSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  status: Joi.string()
    .valid(...FARM_STATUSES)
    .optional(),
  owner: ownerSchema.default({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  }),
  commodityIds: Joi.array().items(Joi.string().trim().required()).min(1).required(),
  location: locationSchema.default({
    country: "",
    region: "",
    city: "",
  }),
  annualProductionEstimateKg: Joi.number().positive().optional(),
  areaHectares: Joi.number().positive().optional(),
  declarationAccepted: Joi.boolean().default(false),
});

export const updateFarmSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  status: Joi.string()
    .valid(...FARM_STATUSES)
    .optional(),
  owner: ownerSchema.optional(),
  commodityIds: Joi.array().items(Joi.string().trim().required()).min(1).optional(),
  location: locationSchema.optional(),
  annualProductionEstimateKg: Joi.number().positive().allow(null).optional(),
  areaHectares: Joi.number().positive().allow(null).optional(),
  declarationAccepted: Joi.boolean().optional(),
}).min(1);

export type CreateFarmSchemaInput = {
  name: string;
  status?: (typeof FARM_STATUSES)[number];
  owner: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  commodityIds: string[];
  location: {
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  annualProductionEstimateKg?: number;
  areaHectares?: number;
  declarationAccepted: boolean;
};

export type UpdateFarmSchemaInput = {
  name?: string;
  status?: (typeof FARM_STATUSES)[number];
  owner?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  commodityIds?: string[];
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  annualProductionEstimateKg?: number | null;
  areaHectares?: number | null;
  declarationAccepted?: boolean;
};
