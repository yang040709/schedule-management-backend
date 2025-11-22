import Router from "koa-router";
import { createResponse } from "../utils/index";
import { scheduleList } from "../mock/schedule";

const router = new Router({});

router.get("/schedule", async (ctx, next) => {
  const newList = [...scheduleList];
  // .sort(() => Math.random() - 0.5)
  // .slice(0, Math.floor(Math.random() * 10));
  ctx.response.body = createResponse({
    total: newList.length,
    data: newList,
  });
  await next();
});

router.post("/schedule", async (ctx, next) => {
  ctx.response.body = createResponse({
    schedule: scheduleList[Math.floor(Math.random() * 10)],
  });
  await next();
});

router.put("/schedule/:id", async (ctx, next) => {
  ctx.response.body = createResponse({
    schedule: {
      ...scheduleList[Math.floor(Math.random() * 10)],
      id: ctx.params.id,
    },
  });
  await next();
});

router.delete("/schedule/:id", async (ctx, next) => {
  ctx.response.body = createResponse({
    message: "delete success",
  });
  await next();
});

router.post("/schedule/ai/generate", async (ctx, next) => {
  ctx.response.body = createResponse({
    ...scheduleList[Math.floor(Math.random() * 10)],
  });
  await next();
});

router.get("/schedule/:id/ai/suggest", async (ctx, next) => {
  ctx.response.body = createResponse({
    suggestion:
      "优先梳理访谈核心数据，用折线图呈现满意度趋势、饼图展示需求分布；按 “问题 - 结论 - 建议” 结构撰写报告，同步给相关同事征集补充意见，确保 10 月 18 日前定稿。",
  });
  await next();
});

router.post("/schedule/:id/ai/suggest-by-edit", async (ctx, next) => {
  ctx.response.body = createResponse({
    suggestion:
      "优先梳理访谈核心数据，用折线图呈现满意度趋势、饼图展示需求分布；按 “问题 - 结论 - 建议” 结构撰写报告，同步给相关同事征集补充意见，确保 10 月 18 日前定稿。",
  });
  await next();
});

export default router;
