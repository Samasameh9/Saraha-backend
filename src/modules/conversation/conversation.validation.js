import { z } from "zod";
import { generalValidationFileds } from "../../common/validation.js";

export const createConversation = (lang) => {
  return z.object({
    body: z.strictObject({
      conversationId: generalValidationFileds.id(lang),
      content: z.string().min(3).max(50000),
    }),
  });
};

export const getConversationMessage = (lang) => {
  return z.object({
    query: z.strictObject({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(20),
    }),
    params: z.strictObject({
      conversationId: generalValidationFileds.id(lang),
    }),
  });
};
