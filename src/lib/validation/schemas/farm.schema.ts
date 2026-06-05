import Joi from "joi";

import { FARM_STATUSES } from "@/config/farm-status";

const codePattern = /^[A-Z0-9_]+$/;

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
  ownershipVerified: Joi.boolean().default(false),
  declarationAccepted: Joi.boolean().default(false),
});

export const updateFarmSchema = Joi.object({
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
  status: Joi.string()
    .valid(...FARM_STATUSES)
    .optional(),
  owner: ownerSchema.optional(),
  commodityIds: Joi.array().items(Joi.string().trim().required()).min(1).optional(),
  location: locationSchema.optional(),
  annualProductionEstimateKg: Joi.number().positive().allow(null).optional(),
  areaHectares: Joi.number().positive().allow(null).optional(),
  ownershipVerified: Joi.boolean().optional(),
  declarationAccepted: Joi.boolean().optional(),
}).min(1);

export type CreateFarmSchemaInput = {
  name: string;
  code: string;
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
  ownershipVerified: boolean;
  declarationAccepted: boolean;
};

export type UpdateFarmSchemaInput = {
  name?: string;
  code?: string;
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
  ownershipVerified?: boolean;
  declarationAccepted?: boolean;
};
