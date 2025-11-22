import Router from "koa-router";
import { createResponse } from "../utils/index";
import { scheduleList } from "../mock/schedule";

const router = new Router({});

router.get("/export/data", async (ctx, next) => {
  const newList = [...scheduleList]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 10));
  ctx.response.body = createResponse({
    total: newList.length,
    data: newList,
  });
  await next();
});

router.post("/import/data", async (ctx, next) => {
  ctx.response.body = createResponse();
  await next();
});

export default router;
