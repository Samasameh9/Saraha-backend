import { Router } from "express";
import {
  FileValidation,
  localFileUpload,
  successResponse,
} from "../../common/utils/index.js";
import {
  identityRequestStatus,
  createMessage,
  deleteMessage,
  getAllMessages,
  getMessageById,
  requestSenderIdentity,
  getIdentityRequests,
} from "./message.service.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";
import * as validator from "./message.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  authentication,
  bearerAuth,
} from "../../middleware/authentication.middleware.js";

const router = Router();

const messageFolderName = "messages";
// create message
router.post(
  "/",
  async (req, res, next) => {
    if (req.headers["authorization"]) {
      await bearerAuth({ req });
    }

    next();
  },
  uploadMiddleware({
    multerMiddleware: localFileUpload().any("attachments", 3),
    validation: FileValidation.image,
    customPath: messageFolderName,
    isRequired: false,
  }),
  validation(validator.createMessage),
  async (req, res, next) => {


    const data = await createMessage(req.body, req.files, req.user);
    return successResponse({ res, status: 201, data });
  },
);

// get all messages
router.get(
  "/",
  authentication(),
  validation(validator.allMessages),
  async (req, res, next) => {
    const data = await getAllMessages(req.validate?.query, req.user);
    return successResponse({ res, status: 200, data });
  },
);

// delete message
router.delete(
  "/:messageId",
  authentication(),
  validation(validator.messageIdValidation),
  async (req, res, next) => {
    const data = await deleteMessage(req.validate?.params, req.user);
    return successResponse({ res, status: 200, data });
  },
);

// get requests
router.get(
  "/identity-request",
  authentication(),
  validation(validator.allRequests),
  async (req, res, next) => {
    const data = await getIdentityRequests(req.validate?.query, req.user);
    return successResponse({ res, status: 200, data });
  },
);

// get message by id
router.get(
  "/:messageId",
  authentication(),
  validation(validator.messageIdValidation),
  async (req, res, next) => {
    const data = await getMessageById(req.validate?.params, req.user);
    return successResponse({ res, status: 200, data });
  },
);

//Request sender identity
router.post(
  "/identity-request/:messageId",
  authentication(),
  validation(validator.messageIdValidation),
  async (req, res, next) => {
    const data = await requestSenderIdentity(req.validate?.params, req.user);
    return successResponse({ res, status: 200, data });
  },
);

//Accept or reject request
router.post(
  "/identity-request-status/:messageId/",
  authentication(),
  validation(validator.identityStatusRequest),
  async (req, res, next) => {
    const data = await identityRequestStatus(
      req.validate?.params,
      req.user,
      req.validate?.body.status,
    );
    return successResponse({ res, status: 200, data });
  },
);

export default router;
