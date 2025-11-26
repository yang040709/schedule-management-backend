import { Schema, model, Model, Document } from "mongoose";
import { CheckInRecord } from "@/types/habit";
import { nanoid } from "nanoid";

const generateRecordId = () => {
  return `record_${nanoid(16)}`;
};

const checkInRecordSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generateRecordId,
    },
    habitId: {
      type: String,
      required: true,
      index: true,
      ref: "Habit",
    },
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
    },
    duration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 添加复合索引，确保同一用户同一习惯同一日期只能有一条记录
checkInRecordSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// 添加查询索引
checkInRecordSchema.index({ habitId: 1, date: -1 });

const CheckInRecordModel = model<CheckInRecord>(
  "CheckInRecord",
  checkInRecordSchema
);

export default CheckInRecordModel;
