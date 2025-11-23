import { Context, Next } from "koa";
import { signToken, verifyToken } from "@/utils/jwt";

export const authenticate = async (ctx: Context, next: Next) => {
  const authHeader = ctx.request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("NO_TOKEN");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    ctx.state.userId = decoded.id;
  } catch (error) {
    throw new Error("INVALID_TOKEN");
  }
  await next();
};
