import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    originalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      required: true,
       unique: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true },
);

export const ConversationModel =
  mongoose.models.conversation ||
  mongoose.model("conversation", conversationSchema);
