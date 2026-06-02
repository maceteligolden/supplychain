import Joi from "joi";

import { createAppError } from "@/lib/errors";

export interface ValidationIssueInterface {
  /** Dot-notation path to the invalid field. */
  path: string;
  /** Human-readable validation message. */
  message: string;
}

type ValidateInput<T> = {
  schema: Joi.Schema<T>;
  data: unknown;
  label?: string;
};

type ValidateOutput<T> = T;

export function validate<T>(input: ValidateInput<T>): ValidateOutput<T> {
  const result = input.schema.validate(input.data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (result.error) {
    const details: ValidationIssueInterface[] = result.error.details.map((detail) => ({
      path: detail.path.join("."),
      message: detail.message,
    }));

    throw createAppError({
      code: "VALIDATION_ERROR",
      message: input.label
        ? `Validation failed for ${input.label}`
        : "Validation failed",
      details: { issues: details },
    });
  }

  return result.value;
}

/** Example schema — replace or extend per feature module. */
export const contactFormSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().trim().min(10).max(2000).required(),
});

export type ContactFormInput = {
  name: string;
  email: string;
  message: string;
};
