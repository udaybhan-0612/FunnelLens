import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    eventType: {
      type: String,
      enum: ["page_view", "click"],
      required: true,
      index: true
    },
    pageUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048
    },
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    click: {
      x: { type: Number, min: 0 },
      y: { type: Number, min: 0 },
      viewportWidth: { type: Number, min: 1 },
      viewportHeight: { type: Number, min: 1 }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

eventSchema.index({ sessionId: 1, timestamp: 1 });
eventSchema.index({ pageUrl: 1, eventType: 1, timestamp: -1 });

export default mongoose.model("Event", eventSchema);
