import User from "@/model/User";
import { signToken } from "@/utils/jwt";

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
  const token = signToken({
    id: user.userId,
  });
  return {
    user,
    token,
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
  const token = signToken({
    id: user.userId,
  });
  return {
    user,
    token,
  };
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
