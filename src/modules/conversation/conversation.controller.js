import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { getConversationMessages, sendConversationMessage } from "./conversation.service.js";
import * as validator from "./conversation.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { successResponse } from "../../common/utils/success.response.js";
const router = Router();


// create conversation
router.post(
  "/",
  authentication(),
  validation(validator.createConversation)
,  async (req, res, next) => {
    const data = await sendConversationMessage(req.validate?.body, req.user);
    return successResponse({ res, status: 201, data });
  },
);

//get conversation messages
router.get(
  "/:conversationId/messages",
  authentication(),
  validation(validator.getConversationMessage)
,  async (req, res, next) => {
    const data = await getConversationMessages(req.validate?.params.conversationId,req.validate?.query, req.user);
    return successResponse({ res, status: 200, data });
  },
);



export default router;
