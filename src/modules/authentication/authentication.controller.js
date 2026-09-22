import { Router } from "express";
import { login, signup, signupWithGmail } from "./authentication.service.js";
import { successResponse } from "../../common/utils/success.response.js";
import * as validator from "./authentication.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post("/signup", validation(validator.signup), async (req, res, next) => {
  const data = await signup(req.body);
  return successResponse({ res, status: 201, data });
});

router.post("/signup-with-gmail ", async (req, res, next) => {
  const { status, data } = await signupWithGmail(
    req.body,
    `${req.protocol}://${req.host}`,
  );
  return successResponse({ res, status, data });
});

router.post("/signin",validation(validator.login), async (req, res, next) => {
  const data = await login(req.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, data });
});

export default router;
