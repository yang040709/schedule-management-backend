import Koa from "koa";
import bodyParser from "koa-bodyparser";
// import TestRouter from "./routes/test1";
import UserRouter from "./routes/user";
import ScheduleRouter from "./routes/schedule";
import SettingRouter from "./routes/setting";
import HabitRouter from "./routes/habit";
import StatsRouter from "./routes/stats";
import logger from "koa-logger";
// import { error } from "console";
import { errorHandler } from "./middlewares/errorsHandler";
const app = new Koa();

app.use(errorHandler);
app.use(bodyParser({}));
app.use(logger());
// /* 新增日志中间件 */
// app.use(async (ctx, next) => {
//   console.log(`${ctx.method} ${ctx.url}`);
//   await next();
// });
app.use(UserRouter.routes()).use(UserRouter.allowedMethods());
app.use(ScheduleRouter.routes()).use(ScheduleRouter.allowedMethods());
app.use(SettingRouter.routes()).use(SettingRouter.allowedMethods());
app.use(HabitRouter.routes()).use(HabitRouter.allowedMethods());
app.use(StatsRouter.routes()).use(StatsRouter.allowedMethods());

// app.use(TestRouter.routes()).use(TestRouter.allowedMethods());
export default app;
