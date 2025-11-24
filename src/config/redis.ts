import { createClient } from "redis";

// Redis 配置
const redisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 60000,
    lazyConnect: true,
  },
};

// 创建 Redis 客户端
const redisClient = createClient(redisConfig);

// 错误处理
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

redisClient.on("disconnect", () => {
  console.log("Redis Client Disconnected");
});

// 连接 Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("Redis Client Connected Successfully");
  } catch (error) {
    console.warn(
      "Failed to connect to Redis, caching will be disabled:",
      error.message
    );
  }
})();

export default redisClient;
