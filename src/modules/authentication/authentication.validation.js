import { z } from "zod";

export const login = z.object({
  email: z.email(),
  password: z.string().min(8).max(16),
});

export const signup = login
  .safeExtend({
    userName: z.string(),
    confirmPassword: z.string().min(8).max(16),
    phone: z.e164(),
  })
  .superRefine((data, ctx) => {
    if (data.password != data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "password mismatch confirm password",
      });
    }
  });
