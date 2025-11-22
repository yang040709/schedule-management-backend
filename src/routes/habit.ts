import Router from "koa-router";
import { createResponse } from "../utils/index";
import { habitList, checkInRecords, achievements } from "../mock/habit";

const router = new Router({});

// 获取习惯列表
router.get("/habits", async (ctx, next) => {
  const { frequency, category, page = 1, pageSize = 10, search } = ctx.query;

  let filteredList = [...habitList];

  // 按频率筛选
  if (frequency) {
    filteredList = filteredList.filter(
      (habit) => habit.frequency === frequency
    );
  }

  // 按分类筛选
  if (category) {
    filteredList = filteredList.filter((habit) =>
      habit.category.includes(category as string)
    );
  }

  // 按搜索词筛选
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredList = filteredList.filter(
      (habit) =>
        habit.title.toLowerCase().includes(searchTerm) ||
        habit.description.toLowerCase().includes(searchTerm)
    );
  }

  // 分页
  const startIndex = (Number(page) - 1) * Number(pageSize);
  const endIndex = startIndex + Number(pageSize);
  const paginatedList = filteredList.slice(startIndex, endIndex);

  ctx.response.body = createResponse({
    total: filteredList.length,
    data: paginatedList,
  });
  await next();
});

// 获取今日需要完成的习惯
router.get("/habits/today", async (ctx, next) => {
  // 模拟今日习惯 - 随机选择一些习惯
  let todayHabits = [...habitList]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 5) + 1);

  todayHabits = todayHabits.map((habit) => {
    return {
      ...habit,
      completed: Math.random() < 0.5,
    };
  });

  ctx.response.body = createResponse({
    habits: todayHabits,
    date: new Date().toISOString().split("T")[0],
  });
  await next();
});

// 添加新的习惯
router.post("/habits", async (ctx, next) => {
  const newHabit = {
    ...ctx.request.body,
    id: `habit-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      totalMissed: 0,
      successRate: 0,
    },
  };

  ctx.response.body = createResponse({
    habit: newHabit,
  });
  await next();
});

// 修改习惯
router.put("/habits/:id", async (ctx, next) => {
  const habit = habitList.find((h) => h.id === ctx.params.id);
  const updatedHabit = {
    ...habit,
    ...ctx.request.body,
    id: ctx.params.id,
    updatedAt: new Date().toISOString(),
  };

  ctx.response.body = createResponse({
    habit: updatedHabit,
  });
  await next();
});

// 删除习惯
router.delete("/habits/:id", async (ctx, next) => {
  ctx.response.body = createResponse({
    message: "delete success",
  });
  await next();
});

// 打卡今天的习惯
router.post("/habits/check-in", async (ctx, next) => {
  const { habitId, notes, mood, duration } = ctx.request.body;

  // 模拟创建打卡记录
  const newRecord = {
    id: `record-${Date.now()}`,
    habitId,
    date: new Date().toISOString().split("T")[0],
    notes,
    mood,
    duration,
  };

  ctx.response.body = createResponse({
    message: "check-in success",
    record: newRecord,
  });
  await next();
});

/* 取消打卡今天的习惯 */
router.delete("/habits/check-in/:habits_id", async (ctx, next) => {
  ctx.response.body = createResponse({
    message: "cancel check-in success",
  });
  await next();
});

// 分页获取习惯打卡记录
router.get("/habits/:habitId/records", async (ctx, next) => {
  const { page = 1, pageSize = 10 } = ctx.query;
  const habitId = ctx.params.habitId;

  const habitRecords = checkInRecords.filter(
    (record) => record.habitId === habitId
  );

  // 分页
  const startIndex = (Number(page) - 1) * Number(pageSize);
  const endIndex = startIndex + Number(pageSize);
  const paginatedRecords = habitRecords.slice(startIndex, endIndex);

  ctx.response.body = createResponse({
    total: habitRecords.length,
    data: paginatedRecords,
  });
  await next();
});

// 获取成就
router.get("/achievements", async (ctx, next) => {
  ctx.response.body = createResponse({
    achievements: achievements,
  });
  await next();
});

router.get("/habits/stats", async (ctx, next) => {
  ctx.response.body = createResponse({
    totalCheckedIn: 46,
    avgSuccessRate: 86,
  });
});

export default router;
