import Router from "@koa/router";
import { createResponse } from "../utils/index";
import { exportSchedule, importSchedule } from "@/service/setting";
import { authenticate } from "@/middlewares/auth";
import { ScheduleDocument } from "@/types/schedule";
import { ImportBody } from "@/types/setting";
const router = new Router({});
router.use(authenticate);
router.get("/export/data", async (ctx, next) => {
  const userId = ctx.state.userId;
  const data = await exportSchedule(userId);
  ctx.response.body = createResponse(data);
  await next();
});

router.post("/import/data", async (ctx, next) => {
  const userId = ctx.state.userId;
  const body = ctx.request.body as ImportBody;
  if (!body || !body.data) {
    throw new Error("请上传数据");
  }
  const list = body.data as ScheduleDocument[];
  const result = await importSchedule(list, userId);
  console.log(result);
  ctx.response.body = createResponse();
  await next();
});

export default router;
