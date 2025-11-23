import { stat } from "fs";
import { Schema, model, Model, Document } from "mongoose";
import { ScheduleDocument } from "@/types/schedule";
import { nanoid } from "nanoid";

const generateScheduleId = () => {
  return `schedule_${nanoid(16)}`;
};

// 可选：为 timeOfDay 定义子 Schema（更清晰）
const TimeOfDaySchema = new Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
        "Invalid time format (HH:mm or HH:mm:ss)",
      ],
    },
    endTime: {
      type: String,
      required: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
        "Invalid time format (HH:mm or HH:mm:ss)",
      ],
    },
  },
  { _id: false }
); // 不需要额外 _id

const scheduleSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true, // 如果业务要求全局唯一
      index: true,
      default: generateScheduleId,
    },
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    AIsuggestion: {
      type: String,
      trim: true,
    },
    /* 
  export type PriorityLevel = 'high' | 'medium' | 'low'
  
  export type ScheduleStatus = 'done' | 'pending' | 'expired' | 'canceled' | 'locked'
  */
    status: {
      type: String,
      enum: ["done", "pending", "expired", "canceled", "locked"],
      default: "pending",
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
      required: true,
    },
    category: [
      {
        type: String,
        trim: true,
      },
    ],
    dependentId: {
      type: String,
      ref: "Schedule", // 可选：表示引用另一个 Schedule 的 id
      index: true,
    },
    date: {
      type: String, // 格式如 "2025-11-22"
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"],
    },
    timeOfDay: TimeOfDaySchema,
  },
  {
    timestamps: true,
    // 保留 toJSON/toObject 行为
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 可选：添加索引
scheduleSchema.index({ date: 1, status: 1 });
scheduleSchema.index({ dependentId: 1 });

// export interface ScheduleModel extends Model<ScheduleDocument> {}
const ScheduleModel = model<ScheduleDocument>("Schedule", scheduleSchema);

export default ScheduleModel;
