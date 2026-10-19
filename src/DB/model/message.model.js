import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: 3,
      maxLength: 50000,
      required: function () {
        return this.attachments?.length > 0 ? false : true;
      },
    },
    attachments: [String],
    senderId: { type: mongoose.Types.ObjectId, ref: "user" },
    receiverId: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    identityRequest: {
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
      },
      requestedAt: Date,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

export const MessageModel =
  mongoose.models.message || mongoose.model("message", messageSchema);
