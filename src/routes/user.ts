import Router from "@koa/router";
import { createResponse } from "../utils/index";
import User from "@/model/User";
import type { LoginFrom } from "@/types/user";
import { login, register, getUserInfo, refreshTokens } from "@/service/user";
import { authenticate } from "@/middlewares/auth";
// import
const router = new Router({
  prefix: "/auth",
});

router.post("/login", async (ctx, next) => {
  const { username, password } = ctx.request.body as LoginFrom;
  const { user, accessToken, refreshToken } = await login(username, password);

  // 设置refreshToken为HttpOnly Cookie
  ctx.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 生产环境启用HTTPS
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  });

  ctx.response.body = createResponse({
    userId: user.userId,
    username: user.username,
    role: user.role,
    accessToken: accessToken,
  });
  await next();
});

router.post("/register", async (ctx, next) => {
  const { username, password } = ctx.request.body as LoginFrom;
  const { user, accessToken, refreshToken } = await register(
    username,
    password
  );

  // 设置refreshToken为HttpOnly Cookie
  ctx.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 生产环境启用HTTPS
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  });

  ctx.response.body = createResponse({
    userId: user.userId,
    username: user.username,
    role: user.role,
    accessToken: accessToken,
  });
  await next();
});

router.get("/refresh", async (ctx, next) => {
  const refreshToken = ctx.cookies.get("refreshToken");
  if (!refreshToken) {
    ctx.status = 401;
    ctx.response.body = {
      code: 401,
      message: "Refresh token not found",
      data: null,
    };
    return;
  }

  try {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await refreshTokens(refreshToken);

    // 更新refreshToken Cookie
    ctx.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    });

    ctx.response.body = createResponse({
      accessToken: newAccessToken,
    });
  } catch (error) {
    ctx.status = 401;
    ctx.response.body = {
      code: 401,
      message: "Invalid refresh token",
      data: null,
    };
  }
  await next();
});

router.post("/logout", async (ctx, next) => {
  // 清除refreshToken Cookie
  ctx.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // 立即过期
  });

  ctx.response.body = createResponse({
    message: "Logout successful",
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
