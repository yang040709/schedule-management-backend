import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not defined.您未定义JWT_SECRET环境变量。请检查您的环境变量设置。"
  );
}

// 生成accessToken (短期token，15分钟)
const signAccessToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  // return jwt.sign(payload, secret, { expiresIn: "15m" });
  /* 测试的时候，过期时间设置为15秒 */
  return jwt.sign(payload, secret, { expiresIn: "15m" });
};

// 生成refreshToken (长期token，7天)
const signRefreshToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

// 验证token
const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

// 向后兼容的signToken函数
const signToken = (payload: object) => {
  return signAccessToken(payload);
};

export { signToken, signAccessToken, signRefreshToken, verifyToken };
