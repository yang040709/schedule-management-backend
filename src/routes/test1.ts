import Router from "koa-router";

const router = new Router({
  prefix: "/auth",
});

router.get("/test1", async (ctx) => {
  ctx.body = {
    message: "hello test1",
  };
});

export default router;
