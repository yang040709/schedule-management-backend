import Router from "@koa/router";
import { createResponse } from "../utils/index";
import { getDashboardStats } from "../service/stats";
import { authenticate } from "@/middlewares/auth";

const router = new Router();

router.use(authenticate);
router.get("/stats", async (ctx, next) => {
  // 从上下文中获取用户ID（假设认证中间件已经设置了ctx.state.user）
  const userId = ctx.state.userId;
  if (!userId) {
    ctx.response.body = createResponse(null);
    ctx.response.status = 401;
    return;
  }

  try {
    const stats = await getDashboardStats(userId);
    ctx.response.body = createResponse(stats);
  } catch (error) {
    console.error("获取统计数据失败:", error);
    ctx.response.body = createResponse(null);
    ctx.response.status = 500;
  }

  await next();
});

export default router;
