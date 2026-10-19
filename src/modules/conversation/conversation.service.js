import { ConversationModel } from "../../DB/model/conversation.model.js";
import { ConversationMessageModel } from "../../DB/model/conversationMessage.model.js";
import { MessageModel } from "../../DB/model/message.model.js";
import { NotFoundException } from "../../common/exception/error.exception.js";
import {
  findOne,
  create,
  paginate,
} from "../../common/repository/base.repository.js";
import {
  findOne as findOneUser,
} from "../../common/repository/message.repository.js";

const getAuthorizedConversation = async (conversationId, userId) => {
  const conversation = await findOne({
    model: ConversationModel,
    filter: {
      _id: conversationId,
      $or: [{ senderId: userId }, { receiverId: userId }],
       
    },
  });
    if (!conversation) {
    throw NotFoundException({
      message: "Conversation not found",
    });
  }
  const originalMessage = await findOneUser({
  model: MessageModel,
  filter: {
    _id: conversation.originalMessageId,
    "identityRequest.status": "ACCEPTED",
  },
});

if (!originalMessage) {
  throw NotFoundException({
    message: "Conversation not found",
  });
}


  return conversation;
};

export const sendConversationMessage = async (
  { conversationId, content },
  user,
) => {
  const conversation = await getAuthorizedConversation(
    conversationId,
    user._id,
  );

  const message = await create({
    model: ConversationMessageModel,
    data: {
      conversationId: conversation._id,
      senderId: user._id,
      content,
    },
  });

  return message;
};

export const getConversationMessages = async (
  conversationId,
  { page = 1, limit = 20 },
  user,
) => {
  const conversation = await getAuthorizedConversation(
    conversationId,
    user._id,
  );
  const {
    docsCount,
    pages,
    currentPage,
    limit: pageSize,
    result: messages,
  } = await paginate({
    model: ConversationMessageModel,
    filter: {
      conversationId: conversation._id,
    },
    page,
    size: limit,
    sort: { createdAt: 1, _id: 1 },
    options: {
      populate: {
        path: "senderId",
        select: "userName",
      },
    },
  });

  return {
    conversation,
    messages,
    docsCount,
    pages,
    page: currentPage,
    limit: pageSize,
  };
};
