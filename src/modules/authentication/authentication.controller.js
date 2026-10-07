import { Router } from "express";
import {
  confirmEmail,
  confirmLogin,
  enableTwoStepVerification,
  login,
  requestForgotPassword,
  resendConfirmEmail,
  resetForgotPassword,
  signup,
  signupWithGmail,
  verifyForgotPassword,
  verifyTwoStepVerification,
} from "./authentication.service.js";
import { successResponse } from "../../common/utils/success.response.js";
import * as validator from "./authentication.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post("/signup", validation(validator.signup), async (req, res, next) => {
  const data = await signup(req.validate.body);
  return successResponse({ res, status: 201, data });
});

router.patch(
  "/confirm-email",
  validation(validator.confirmEmailValidation),
  async (req, res, next) => {
    const data = await confirmEmail(req.validate.body);
    return successResponse({ res, status: 200, data });
  },
);

router.patch(
  "/resend-confirm-email",
  validation(validator.resendConfirmEmailValidation),
  async (req, res, next) => {
    const data = await resendConfirmEmail(req.validate.body);
    return successResponse({ res, status: 200, data });
  },
);

router.patch(
  "/enable-two-step-verification",
  validation(validator.resendConfirmEmailValidation),
  async (req, res, next) => {
    const data = await enableTwoStepVerification(req.validate.body);
    return successResponse({ res, status: 200, data });
  },
);

router.post(
  "/request-forgot-password",
  validation(validator.resendConfirmEmailValidation),
  async (req, res, next) => {
    const data = await requestForgotPassword(req.validate.body);
    return successResponse({ res, status: 201, data });
  },
);

router.post(
  "/verify-forgot-password",
  validation(validator.confirmEmailValidation),
  async (req, res, next) => {
    const data = await verifyForgotPassword(req.validate.body);
    return successResponse({ res, status: 200, data });
  },
);

router.patch(
  "/reset-forgot-password",
  validation(validator.resetForgotPasswordValidation),
  async (req, res, next) => {
    const data = await resetForgotPassword(req.validate.body);
    return successResponse({ res, status: 200, data });
  },
);

router.patch(
  "/verify-two-step-verification",
  validation(validator.confirmEmailValidation),
  async (req, res, next) => {
    const data = await verifyTwoStepVerification(req.validate.body);
    return successResponse({ res, status: 200, data });
  },
);

router.patch(
  "/confirm-two-step-verification",
  validation(validator.confirmEmailValidation),
  async (req, res, next) => {
    const data = await confirmLogin(
      req.validate.body,
      `${req.protocol}://${req.host}`,
    );
    return successResponse({ res, status: 200, data });
  },
);

router.post("/signup-with-gmail ", async (req, res, next) => {
  const { status, data } = await signupWithGmail(
    req.body,
    `${req.protocol}://${req.host}`,
  );
  return successResponse({ res, status, data });
});

router.post("/signin", validation(validator.login), async (req, res, next) => {
  const data = await login(req.validate.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, data });
});

export default router;
