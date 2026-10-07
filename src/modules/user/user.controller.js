import { Router } from "express";
import {
  FileValidation,
  localFileUpload,
  successResponse,
} from "../../common/utils/index.js";
import { logout, profile, rotateToken, update } from "./user.service.js";
import {
  authentication,
  authorization,
  uploadMiddleware,
} from "../../middleware/index.js";
import { tokenTypeEnum } from "../../common/enum/security.enum.js";
import { roleEnum } from "../../common/enum/user.enum.js";

const router = Router();

router.get("/", authentication(), async (req, res, next) => {
  const data = await profile(req.user);
  return successResponse({ res, data });
});

router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({ maxFileSize: 2 }).single("attachment"),
    customPath: "user",
    validation: FileValidation.image,
  }),
  async (req, res, next) => {
    req.user.image = req.file.finalPath;
    console.log(req.file.finalPath);

    await req.user.save();
    return successResponse({ res, data: { user: req.user } });
  },
);

router.patch(
  "/",
  authentication(),
  authorization(roleEnum.ADMIN),
  async (req, res, next) => {
    const data = await update(req.user, req.body);
    return successResponse({ res, data });
  },
);

router.post(
  "/rotate-token",
  authentication(tokenTypeEnum.REFRESH),
  async (req, res, next) => {
    const data = await rotateToken(
      req.payload,
      req.user,
      `${req.protocol}://${req.host}`,
    );
    return successResponse({ res, data });
  },
);

router.post("/logout", authentication(), async (req, res, next) => {
  const data = await logout(req.payload, req.user, req.body);
  return successResponse({ res, data });
});

export default router;
