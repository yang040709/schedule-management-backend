import Router from "koa-router";
import { createResponse } from "../utils/index";
import { scheduleList } from "../mock/schedule";

const router = new Router({});

router.get("/schedule", async (ctx) => {
  const newList = [...scheduleList]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 10));
  ctx.response.body = createResponse({
    total: newList.length,
    data: newList,
  });
});

router.post("/schedule", async (ctx) => {
  return createResponse({
    schedule: scheduleList[Math.floor(Math.random() * 10)],
  });
});

router.delete("/schedule", async (ctx) => {
  return createResponse({
    message: "delete success",
  });
});

router.post("/schedule/ai/generate", async (ctx) => {
  return createResponse({
    schedule: scheduleList[Math.floor(Math.random() * 10)],
  });
});

router.post("/schedule/:id/ai/suggest", async (ctx) => {
  return createResponse({
    suggestion:
      "优先梳理访谈核心数据，用折线图呈现满意度趋势、饼图展示需求分布；按 “问题 - 结论 - 建议” 结构撰写报告，同步给相关同事征集补充意见，确保 10 月 18 日前定稿。",
  });
});

export default router;
