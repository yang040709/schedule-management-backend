import Router from "@koa/router";
import { createResponse } from "../utils/index";
import User from "@/model/User";
import type { LoginFrom } from "@/types/user";
import { signToken } from "@/utils/jwt";
import { login, register, getUserInfo } from "@/service/user";
import { authenticate } from "@/middlewares/auth";
// import
const router = new Router({
  prefix: "/auth",
});

router.post("/login", async (ctx, next) => {
  const { username, password } = ctx.request.body as LoginFrom;
  const { user, token } = await login(username, password);
  ctx.response.body = createResponse({
    userId: user.userId,
    username: user.username,
    role: user.role,
    token,
  });
  await next();
});

router.post("/register", async (ctx, next) => {
  const { username, password } = ctx.request.body as LoginFrom;
  const { user, token } = await register(username, password);
  ctx.response.body = createResponse({
    userId: user.userId,
    username: user.username,
    role: user.role,
    token,
  });
  await next();
});

router.get("/verify", authenticate, async (ctx, next) => {
  console.log(ctx.header.authorization, "<===verify");
  console.log(ctx.state.userId, "<===userId");
  const { userId } = ctx.state;
  const { user } = await getUserInfo(userId);
  ctx.response.body = createResponse({
    userId: user.userId,
    username: user.username,
    role: user.role,
  });
  await next();
});

export default router;
