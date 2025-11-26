import { Schema, model, Model, Document } from "mongoose";
import { HabitDocument } from "@/types/habit";
import { nanoid } from "nanoid";

const generateHabitId = () => {
  return `habit_${nanoid(16)}`;
};

// 目标设置子 Schema
const GoalSchema = new Schema(
  {
    targetDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 1440, // 24小时
    },
  },
  { _id: false }
);

// 习惯统计子 Schema
const HabitStatsSchema = new Schema(
  {
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMissed: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const habitSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generateHabitId,
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
    goal: GoalSchema,
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    category: [
      {
        type: String,
        trim: true,
      },
    ],
    stats: HabitStatsSchema,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 添加索引
habitSchema.index({ userId: 1, frequency: 1 });
habitSchema.index({ userId: 1, category: 1 });
habitSchema.index({ "stats.currentStreak": -1 });

const HabitModel = model<HabitDocument>("Habit", habitSchema);

export default HabitModel;
