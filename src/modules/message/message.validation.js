import mongoose from "mongoose";
import { z } from "zod";
import { generalValidationFileds } from "../../common/validation.js";

export const createMessage = (lang) => {
  return z
    .object({
      body: z.strictObject({
        content: z.string().min(3).max(50000).optional(),
        receiverId: generalValidationFileds.id(lang),
      }),
      files: z.array(generalValidationFileds.file(lang)).max(3).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.body.content && !data.files?.length) {
        ctx.addIssue({
          code: "custom",
          message: "missing message content",
          path: ["content"],
        });
      }
    });
};

export const allMessages = (lang) => {
  return z.object({
    query: z.strictObject({
      type: z.enum(["0", "1", "2"]).default("0"),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(5),
    }),
  });
};

export const messageIdValidation = (lang) => {
  return z.object({
    params: z.strictObject({
      messageId: generalValidationFileds.id(lang),
    }),
  });
};

export const identityStatusRequest = (lang) => {
  return z.object({
    params: z.strictObject({
      messageId: generalValidationFileds.id(lang),
    }),
    body: z.strictObject({
      status: z.enum(["accept", "reject"]),
    }),
  });
};

export const allRequests = (lang) => {
  return z.object({
    query: z.strictObject({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(5),
    }),
  });
};


