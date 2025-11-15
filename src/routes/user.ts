import Router from "koa-router";
import { createResponse } from "../utils/index";

const router = new Router({
  prefix: "/auth",
});

router.post("/login", async (ctx) => {
  // @ts-ignore
  console.log(ctx.request.body);
  ctx.response.body = createResponse({
    userId: "123",
    username: "test",
    token: "123456789",
  });
});

router.post("/register", async (ctx) => {
  // @ts-ignore
  console.log(ctx.request.body);
  ctx.response.body = createResponse({
    userId: "123",
    username: "test",
    token: "1234567812129",
  });
});

router.get("/verify", async (ctx) => {
  ctx.body = createResponse({
    userId: "123",
    username: "test",
  });
});

export default router;
