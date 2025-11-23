import type { Context, Next } from "koa";
import { createError, createResponse } from "@/utils/index";

const errorMsgMap = {
  USER_EXISTS: "用户已存在",
  INVALID_TOKEN: "无效的token",
  NO_TOKEN: "没有token",
};

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    console.log(err.message, "<==err");
    if (err.message in errorMsgMap) {
      ctx.body = createError(errorMsgMap[err.message]);
    } else {
      ctx.body = createError("服务器错误");
    }
  }
};
