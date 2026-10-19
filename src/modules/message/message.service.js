import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exception/error.exception.js";
import {
  create,
  deleteOne,
  findOne,
  paginate,
} from "../../common/repository/message.repository.js";
import {
  findOneAndUpdate,
  findOne as findOneUser,
} from "../../common/repository/base.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { ConversationModel } from "../../DB/model/conversation.model.js";

export const createMessage = async (
  { content, receiverId } = {},
  files = [],
  user = undefined,
) => {
  const checkReceiverExist = await findOneUser({
    model: UserModel,
    filter: {
      _id: receiverId,
    },
  });
  if (!checkReceiverExist) {
    throw NotFoundException({ message: "invalid receiver id" });
  }
  const message = await create({
    data: {
      content,
      receiverId,
      attachments: files?.map((ele) => ele.path),
      ...(user ? { senderId: user._id } : {}),
    },
  });

  return message;
};

const hideSenderIdentity = (message) => {
  const result = message.toObject();

  if (result.senderId && result.identityRequest?.status !== "ACCEPTED") {
    delete result.senderId;
  }

  return result;
};

export const getAllMessages = async (
  { type, page = 1, limit = 5 } = {},
  user,
) => {
  let filterType = {};

  if (type == "0") {
    filterType = { receiverId: user._id };
  } else if (type == "1") {
    filterType = { senderId: user._id };
  } else {
    filterType = {
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    };
  }

  const {
    docsCount,
    pages,
    currentPage,
    limit: pageSize,
    result: messages,
  } = await paginate({
    filter: filterType,
    page,
    size: limit,
    sort: { createdAt: -1 },
  });

  return {
    docsCount,
    pages,
    page: currentPage,
    limit: pageSize,
    messages: messages.map(hideSenderIdentity),
  };
};

export const deleteMessage = async ({ messageId }, user) => {
  const data = await deleteOne({
    filter: { receiverId: user._id, _id: messageId },
  });
  if (!data.deletedCount) {
    throw NotFoundException({ message: "invalid message id" });
  }
  return data;
};

export const getMessageById = async ({ messageId }, user) => {
  const data = await findOne({
    filter: { receiverId: user._id, _id: messageId },
  });
  if (!data) {
    throw NotFoundException({ message: "invalid message id" });
  }

  return hideSenderIdentity(data);
};

export const getIdentityRequests = async (
  { page = 1, limit = 5 } = {},
  user,
) => {
  const {
    docsCount,
    pages,
    currentPage,
    limit: pageSize,
    result: requests,
  } = await paginate({
    filter: {
      senderId: user._id,
      "identityRequest.status": {
        $in: ["PENDING", "ACCEPTED", "REJECTED"],
      },
    },
    page,
    size: limit,
    sort: { createdAt: -1 },
  });

  return {
    docsCount,
    pages,
    page: currentPage,
    limit: pageSize,
    requests,
  };
};

export const requestSenderIdentity = async ({ messageId }, user) => {
  const message = await findOne({
    filter: { receiverId: user._id, _id: messageId },
  });
  if (!message) {
    throw NotFoundException({ message: "invalid message id" });
  }
  if (message.identityRequest?.status) {
    throw ConflictException({
      message: "Identity request already exists",
    });
  }
  message.identityRequest = {
    status: "PENDING",
    requestedAt: new Date(),
  };
  await message.save();
  return {
    message: "Identity request created successfully",
    data: {
      messageId: message._id,
      identityRequest: message.identityRequest,
    },
  };
};

export const identityRequestStatus = async ({ messageId }, user, status) => {
  const message = await findOne({
    filter: {
      senderId: user._id,
      _id: messageId,
    },
  });

  if (!message) {
    throw NotFoundException({
      message: "Invalid message id",
    });
  }

  if (message.identityRequest?.status !== "PENDING") {
    throw ConflictException({
      message: "No pending identity request exists",
    });
  }

  if (status !== "accept" && status !== "reject") {
    throw BadRequestException({
      message: "Status must be accept or reject",
    });
  }

  message.identityRequest.status =
    status === "accept" ? "ACCEPTED" : "REJECTED";

  message.identityRequest.respondedAt = new Date();

  await message.save();

  let conversation = null;

  if (status === "accept") {
    conversation = await findOneAndUpdate({
      model: ConversationModel,
      filter: {
        originalMessageId: message._id,
      },
      update: {
        $setOnInsert: {
          originalMessageId: message._id,
          senderId: message.senderId,
          receiverId: message.receiverId,
        },
      },
      options: {
        upsert: true,
        new: true,
        runValidators: true,
      },
    });
  }

  return {
    message:
      status === "accept"
        ? "Identity request accepted successfully"
        : "Identity request rejected successfully",
    data: status === "accept" && {
      senderId: message.senderId,
      conversationId: conversation._id,
    },
  };
};
