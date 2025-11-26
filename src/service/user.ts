import User from "@/model/User";
import { signAccessToken, signRefreshToken, verifyToken } from "@/utils/jwt";

export const register = async (username: string, password: string) => {
  const existing = await User.findOne({
    username,
  });
  if (existing) {
    throw new Error("USER_EXISTS");
  }
  const user = await User.create({
    username,
    password,
  });
  await user.save();
  const accessToken = signAccessToken({
    id: user.userId,
  });
  const refreshToken = signRefreshToken({
    id: user.userId,
  });
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (username: string, password: string) => {
  const user = await User.findOne({
    username,
  });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  if (!(await user.matchPassword(password))) {
    throw new Error("PASSWORD_INCORRECT");
  }
  const accessToken = signAccessToken({
    id: user.userId,
  });
  const refreshToken = signRefreshToken({
    id: user.userId,
  });
  return {
    user,
    accessToken,
    refreshToken,
  };
};

// 刷新token
export const refreshTokens = async (refreshToken: string) => {
  try {
    const decoded = verifyToken(refreshToken) as {
      id: string;
    };
    const user = await User.findOne({ userId: decoded.id });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const newAccessToken = signAccessToken({
      id: user.userId,
    });
    const newRefreshToken = signRefreshToken({
      id: user.userId,
    });
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }
};

export const getUserInfo = async (userId: string) => {
  const user = await User.findOne({
    userId,
  });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return {
    user: user,
  };
};
