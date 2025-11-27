import Router from "@koa/router";
import { createResponse } from "../utils/index";

import {
  GenerateSchedule,
  ModifyScheduleForm,
  Schedule,
  ScheduleForm,
  ScheduleListQuery,
} from "@/types/schedule";
import {
  addSchedule,
  deleteSchedule,
  generateAISuggest,
  generateAISuggestByEdit,
  generateSchedule,
  getScheduleFlow,
  getScheduleList,
  modifySchedule,
} from "@/service/schedule";
import { authenticate } from "@/middlewares/auth";
const router = new Router({});

/* 
  所有路由都需要认证
*/
router.use(authenticate);

router.get("/schedule", async (ctx, next) => {
  const scheduleListQuery = ctx.request.query as ScheduleListQuery;
  const scheduleList = await getScheduleList(
    scheduleListQuery,
    ctx.state.userId
  );
  ctx.response.body = createResponse({
    total: scheduleList.length,
    data: scheduleList,
  });
  await next();
});

router.post("/schedule", async (ctx, next) => {
  const scheduleForm = ctx.request.body as ScheduleForm;
  const schedule = await addSchedule(scheduleForm, ctx.state.userId);
  ctx.response.body = createResponse({
    schedule,
  });
  await next();
});

router.put("/schedule/:id", async (ctx, next) => {
  const modifyScheduleForm = ctx.request.body as ModifyScheduleForm;
  const id = ctx.params.id;
  const schedule = await modifySchedule(
    id,
    modifyScheduleForm,
    ctx.state.userId
  );
  ctx.response.body = createResponse({
    schedule,
  });
  await next();
});

router.delete("/schedule/:id", async (ctx, next) => {
  const id = ctx.params.id;
  await deleteSchedule(id, ctx.state.userId);
  ctx.response.body = createResponse(undefined);
  await next();
});

router.post("/schedule/ai/generate", async (ctx, next) => {
  const { content } = ctx.request.body as GenerateSchedule;

  const schedule = await generateSchedule(content, ctx.state.userId);
  ctx.response.body = createResponse({
    ...schedule,
  });
  await next();
});

router.get("/schedule/:id/ai/suggest", async (ctx, next) => {
  const id = ctx.params.id;
  const suggest = await generateAISuggest(id, ctx.state.userId);
  ctx.response.body = createResponse({
    suggestion: suggest,
  });
  await next();
});

router.post("/schedule/:id/ai/suggest-by-edit", async (ctx, next) => {
  const id = ctx.params.id;
  const modifyScheduleForm = ctx.request.body as ModifyScheduleForm;
  const suggest = await generateAISuggestByEdit(
    id,
    modifyScheduleForm,
    ctx.state.userId
  );
  ctx.response.body = createResponse({
    suggestion: suggest,
  });
  await next();
});

/* 
获取日程的整个流程链
*/
router.get("/schedule/:id/flow", async (ctx, next) => {
  const id = ctx.params.id;
  const flowArr = await getScheduleFlow(id, ctx.state.userId);
  ctx.response.body = createResponse({
    flow: flowArr,
  });
  await next();
});

export default router;
