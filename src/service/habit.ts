import HabitModel from "@/model/Habit";
import CheckInRecordModel from "@/model/CheckInRecord";
import { NotFoundError, HABIT_ERRORS } from "@/utils/errors";
import { cacheService, CACHE_KEYS } from "@/utils/cache";
import {
  HabitDocument,
  HabitForm,
  HabitListQuery,
  ModifyHabitForm,
  CheckInForm,
  CheckInRecord,
  Achievement,
  AllStats,
} from "@/types/habit";

export const addHabit = async (habitForm: HabitForm, userId: string) => {
  const habit = await HabitModel.create({
    title: habitForm.title,
    description: habitForm.description,
    goal: habitForm.goal,
    frequency: habitForm.frequency,
    category: habitForm.category,
    stats: {
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      totalMissed: 0,
      successRate: 0,
    },
    userId,
  });
  await habit.save();

  // 清除该用户的习惯列表缓存
  await cacheService.deleteByPattern(`${CACHE_KEYS.HABIT_LIST}:${userId}:*`);

  return habit;
};

export const getHabitList = async (query: HabitListQuery, userId: string) => {
  // 生成缓存键
  const cacheKey = `${CACHE_KEYS.HABIT_LIST}:${userId}:${JSON.stringify(
    query
  )}`;

  // 尝试从缓存获取
  const cachedResult = await cacheService.get<any[]>(cacheKey);
  if (cachedResult) {
    console.log("Cache hit for habit list");
    return cachedResult;
  }

  console.log("Cache miss for habit list, querying database");

  // 构建基础查询条件
  const conditions: any = { userId };

  if (query.frequency) {
    conditions.frequency = query.frequency;
  }
  if (query.category) {
    conditions.category = { $in: [query.category] };
  }
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    conditions.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
    ];
  }

  let habitResult = HabitModel.find(conditions);

  // 分页处理
  if (query.page && query.pageSize) {
    habitResult = habitResult
      .skip(query.pageSize * (query.page - 1))
      .limit(query.pageSize);
  }

  const habitList = await habitResult;

  const jsonHabitList = habitList.map((habit) => {
    return habit.toJSON();
  });
  // 缓存结果，TTL 设置为 5 分钟
  await cacheService.set(cacheKey, jsonHabitList, 300);

  // console.log(habitList, "<==habits list");

  return jsonHabitList;
};

export const modifyHabit = async (
  id: string,
  updateData: ModifyHabitForm,
  userId: string
) => {
  const saveKeyList = ["title", "description", "goal", "frequency", "category"];

  // 过滤掉 undefined/null 值和无效的 key 值
  const cleanedUpdate = Object.fromEntries(
    Object.entries(updateData)
      .filter(([_, v]) => v !== undefined && v !== null)
      .filter(([k]) => saveKeyList.includes(k))
  );

  // 执行更新
  const updated = await HabitModel.findOneAndUpdate(
    {
      id,
      userId,
    },
    { $set: cleanedUpdate },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new NotFoundError(HABIT_ERRORS.NOT_FOUND);
  }

  // 清除该用户的习惯列表缓存
  await cacheService.deleteByPattern(`${CACHE_KEYS.HABIT_LIST}:${userId}:*`);

  return updated;
};

export const deleteHabit = async (id: string, userId: string) => {
  if (!id) {
    throw new NotFoundError(HABIT_ERRORS.NEED_ID);
  }

  // 删除习惯及其相关的打卡记录
  const deleted = await HabitModel.findOneAndDelete({
    id,
    userId,
  });

  if (!deleted) {
    throw new NotFoundError(HABIT_ERRORS.NOT_FOUND);
  }

  // 删除相关的打卡记录
  await CheckInRecordModel.deleteMany({
    habitId: id,
    userId,
  });

  // 清除该用户的习惯列表缓存
  await cacheService.deleteByPattern(`${CACHE_KEYS.HABIT_LIST}:${userId}:*`);

  return deleted;
};

export const checkInHabit = async (
  checkInForm: CheckInForm,
  userId: string
) => {
  const { habitId, duration, notes, mood } = checkInForm;
  const today = new Date();

  // 检查习惯是否存在
  const habit = await HabitModel.findOne({ id: habitId, userId });
  if (!habit) {
    throw new NotFoundError(HABIT_ERRORS.NOT_FOUND);
  }

  // 检查今天是否已经打卡
  const existingRecord = await CheckInRecordModel.findOne({
    habitId,
    userId,
    date: today,
  });

  if (existingRecord) {
    throw new Error(HABIT_ERRORS.ALREADY_CHECKED_IN);
  }

  // 创建打卡记录
  const newRecord = await CheckInRecordModel.create({
    habitId,
    userId,
    date: today,
    duration,
    notes,
    mood,
  });

  // 更新习惯统计信息
  const updatedStats = await updateHabitStats(habitId, userId);

  // 清除相关缓存
  await cacheService.deleteByPattern(`${CACHE_KEYS.HABIT_LIST}:${userId}:*`);
  await cacheService.deleteByPattern(
    `${CACHE_KEYS.HABIT_RECORDS}:${habitId}:*`
  );

  return {
    record: newRecord,
    updatedStats,
  };
};

export const cancelCheckIn = async (habitId: string, userId: string) => {
  const today = new Date();

  // 删除今天的打卡记录
  const deleted = await CheckInRecordModel.findOneAndDelete({
    habitId,
    userId,
    date: today,
  });

  if (!deleted) {
    throw new NotFoundError(HABIT_ERRORS.NO_CHECK_IN_RECORD);
  }

  // 更新习惯统计信息
  const updatedStats = await updateHabitStats(habitId, userId);

  // 清除相关缓存
  await cacheService.deleteByPattern(`${CACHE_KEYS.HABIT_LIST}:${userId}:*`);
  await cacheService.deleteByPattern(
    `${CACHE_KEYS.HABIT_RECORDS}:${habitId}:*`
  );

  return {
    message: "取消打卡成功",
    updatedStats,
  };
};

export const getCheckInRecords = async (
  habitId: string,
  userId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  // 检查习惯是否存在
  const habit = await HabitModel.findOne({ id: habitId, userId });
  if (!habit) {
    throw new NotFoundError(HABIT_ERRORS.NOT_FOUND);
  }

  // 生成缓存键
  const cacheKey = `${CACHE_KEYS.HABIT_RECORDS}:${habitId}:${page}:${pageSize}`;

  // 尝试从缓存获取
  const cachedResult = await cacheService.get<any>(cacheKey);
  if (cachedResult) {
    console.log("Cache hit for habit records");
    return cachedResult;
  }

  console.log("Cache miss for habit records, querying database");

  const total = await CheckInRecordModel.countDocuments({ habitId, userId });
  const records = await CheckInRecordModel.find({ habitId, userId })
    .sort({ date: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  const result = {
    total,
    data: records,
  };

  // 缓存结果，TTL 设置为 5 分钟
  await cacheService.set(cacheKey, result, 300);

  return result;
};

export const getHabitStats = async (userId: string): Promise<AllStats> => {
  // 获取用户的所有习惯
  const habits = await HabitModel.find({ userId });

  if (habits.length === 0) {
    return {
      totalCheckedIn: 0,
      avgSuccessRate: 0,
    };
  }

  // 计算总打卡次数
  const totalCheckedIn = await CheckInRecordModel.countDocuments({ userId });

  // 计算平均成功率
  const avgSuccessRate =
    habits.reduce((sum, habit) => sum + habit.stats.successRate, 0) /
    habits.length;

  return {
    totalCheckedIn,
    avgSuccessRate: Math.round(avgSuccessRate),
  };
};

export const getAchievements = async (
  userId: string
): Promise<Achievement[]> => {
  // 这里可以基于用户的习惯数据生成成就
  // 目前返回空数组，后续可以根据业务需求实现具体的成就逻辑
  return [];
};

// 辅助函数：更新习惯统计信息
const updateHabitStats = async (habitId: string, userId: string) => {
  const habit = await HabitModel.findOne({ id: habitId, userId });
  if (!habit) return null;

  // 获取所有打卡记录
  const records = await CheckInRecordModel.find({ habitId, userId }).sort({
    date: 1,
  });

  if (records.length === 0) {
    // 如果没有记录，重置统计
    habit.stats = {
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      totalMissed: 0,
      successRate: 0,
    };
  } else {
    // 计算连续打卡天数
    let currentStreak = 0;
    let longestStreak = 0;
    let totalCompleted = records.length;

    // 按日期排序后计算连续打卡
    const sortedDates = records.map((r) => r.date).sort();
    console.log(sortedDates, "<=sortedDates");
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    currentStreak = tempStreak; // 当前连续天数是最后一段

    // 计算成功率（基于目标天数，确保不超过100%）
    const totalDays = Math.ceil(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const expectedCompletions = Math.min(totalDays, habit.goal.targetDays);
    const successRate =
      expectedCompletions > 0
        ? Math.min(
            Math.round((totalCompleted / expectedCompletions) * 100),
            100
          )
        : 0;

    habit.stats = {
      currentStreak,
      longestStreak,
      totalCompleted,
      totalMissed: Math.max(0, expectedCompletions - totalCompleted),
      successRate,
    };
  }

  await habit.save();
  return habit.stats;
};
