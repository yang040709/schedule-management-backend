import Router from "@koa/router";
import { createResponse } from "../utils/index";
import {
  addHabit,
  getHabitList,
  modifyHabit,
  deleteHabit,
  checkInHabit,
  cancelCheckIn,
  getCheckInRecords,
  getHabitStats,
  getAchievements,
} from "@/service/habit";
import CheckInRecordModel from "@/model/CheckInRecord";
import { authenticate } from "@/middlewares/auth";
import {
  HabitForm,
  HabitListQuery,
  ModifyHabitForm,
  CheckInForm,
} from "@/types/habit";

const router = new Router({});

/* 
  所有路由都需要认证
*/
router.use(authenticate);

// 获取习惯列表
router.get("/habits", async (ctx, next) => {
  const habitListQuery = ctx.request.query as HabitListQuery;
  const habitList = await getHabitList(habitListQuery, ctx.state.userId);
  ctx.response.body = createResponse({
    total: habitList.length,
    data: habitList,
  });
  await next();
});

// 获取今日需要完成的习惯
router.get("/habits/today", async (ctx, next) => {
  // 获取用户的所有习惯
  const habits = await getHabitList({}, ctx.state.userId);
  const today = new Date();

  // 获取今天的打卡记录
  const todayRecords = await CheckInRecordModel.find({
    userId: ctx.state.userId,
    date: today.toISOString().split("T")[0],
  });
  console.log(todayRecords, "<====");
  const todayHabits = habits
    .map((habit) => {
      const isCompleted = todayRecords.some(
        (record) => record.habitId === habit.id
      );
      return {
        ...habit,
        completed: isCompleted,
      };
    })
    .filter((item) => item !== null);

  ctx.response.body = createResponse({
    habits: todayHabits,
    date: today,
  });
  await next();
});

// 添加新的习惯
router.post("/habits", async (ctx, next) => {
  const habitForm = ctx.request.body as HabitForm;
  const habit = await addHabit(habitForm, ctx.state.userId);
  ctx.response.body = createResponse({
    habit,
  });
  await next();
});

// 修改习惯
router.put("/habits/:id", async (ctx, next) => {
  const modifyHabitForm = ctx.request.body as ModifyHabitForm;
  const id = ctx.params.id;
  const habit = await modifyHabit(id, modifyHabitForm, ctx.state.userId);
  ctx.response.body = createResponse({
    habit,
  });
  await next();
});

// 删除习惯
router.delete("/habits/:id", async (ctx, next) => {
  const id = ctx.params.id;
  await deleteHabit(id, ctx.state.userId);
  ctx.response.body = createResponse(undefined);
  await next();
});

// 打卡今天的习惯
router.post("/habits/check-in", async (ctx, next) => {
  const checkInForm = ctx.request.body as CheckInForm;
  const result = await checkInHabit(checkInForm, ctx.state.userId);
  ctx.response.body = createResponse({
    message: "check-in success",
    record: result.record,
    updatedStats: result.updatedStats,
  });
  await next();
});

/* 取消打卡今天的习惯 */
router.delete("/habits/check-in/:habits_id", async (ctx, next) => {
  const habitId = ctx.params.habits_id;
  const result = await cancelCheckIn(habitId, ctx.state.userId);
  ctx.response.body = createResponse({
    message: "cancel check-in success",
    updatedStats: result.updatedStats,
  });
  await next();
});

// 分页获取习惯打卡记录
router.get("/habits/:habitId/records", async (ctx, next) => {
  const { page = 1, pageSize = 10 } = ctx.query;
  const habitId = ctx.params.habitId;
  const records = await getCheckInRecords(
    habitId,
    ctx.state.userId,
    Number(page),
    Number(pageSize)
  );
  ctx.response.body = createResponse({
    total: records.total,
    data: records.data,
  });
  await next();
});

// 获取成就
router.get("/achievements", async (ctx, next) => {
  const achievements = await getAchievements(ctx.state.userId);
  ctx.response.body = createResponse({
    achievements,
  });
  await next();
});

router.get("/habits/stats", async (ctx, next) => {
  const stats = await getHabitStats(ctx.state.userId);
  ctx.response.body = createResponse(stats);
  await next();
});

export default router;
