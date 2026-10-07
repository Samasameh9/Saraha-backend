import { z } from "zod";
import { genderEnum } from "./enum/user.enum.js";
import { languageEnum } from "./enum/security.enum.js";

const matchFields = ({ original, copy, data, ctx, lang }) => {
  if (data[original] != data[copy]) {
    ctx.addIssue({
      code: "custom",
      path: [copy],
      message:
        lang == languageEnum.AR
          ? `لا توافق بين ${original}و ${copy}`
          : `${original} mismatch with ${copy}`,
    });
  }
};

export const generalValidationFileds = {
  email: (lang) =>
    z.email({
      message:
        lang == languageEnum.AR
          ? "ادخال البريد الاكتروني غير صحيح"
          : "invalid email format",
    }),
  password: (lang) =>
    z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\s{0,})(?=.*[!@#$%^&*()_]).{8,16}$/,
      ),
  userName: (lang) =>
    z
      .string()
      .min(2, {
        message:
          lang == languageEnum.AR
            ? "عفوا لا يمكن ادخال اسم المستخدم اقل من حرفين"
            : "minimum length of username is 2",
      })
      .max(30, {
        message:
          lang == languageEnum.AR
            ? "عفوا الحد الاقصي لاسم المستخدم ثلاثين حرف"
            : "maximum length of username is 30",
      }),
  phone: (lang) => z.e164(),
  otp:(lang)=>z.string().regex(/^\d{6}$/,{error:"invalid code"}),
  gender: (lang) =>
    z.union([z.literal(genderEnum.Male), z.literal(genderEnum.Female)]),
  matchFields,
};
