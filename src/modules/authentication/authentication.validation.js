import { z } from "zod";
import { genderEnum } from "../../common/enum/user.enum.js";
import { generalValidationFileds } from "../../common/validation.js";

export const loginSchema = (lang) => {
  return z.object({
    email: generalValidationFileds.email(lang),
    password: generalValidationFileds.password(lang),
  });
};
export const login = (lang) => {
  return z.object({
    body: loginSchema(lang),
    query: z.strictObject({
      darkMood: z.stringbool().optional(),
    }),
  });
};
export const signup = (lang) => {
  return z.object({
    body: loginSchema(lang)
      .safeExtend({
        userName: generalValidationFileds.userName(lang),
        confirmPassword: generalValidationFileds.password(lang),
        phone: generalValidationFileds.phone(lang),
        gender: generalValidationFileds.gender(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFileds.matchFields({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};

export const resendConfirmEmailValidation = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFileds.email(lang),
    }),
  });
};

export const confirmEmailValidation = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFileds.email(lang),
      otp: generalValidationFileds.otp(lang),
    }),
  });
};

export const resetForgotPasswordValidation = (lang) => {
  return z.object({
    body: z
      .strictObject({
        email: generalValidationFileds.email(lang),
        otp: generalValidationFileds.otp(lang),
        password: generalValidationFileds.password(lang),
        confirmPassword: generalValidationFileds.password(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFileds.matchFields({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};
