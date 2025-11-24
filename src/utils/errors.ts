/**
 * 自定义错误类型
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 业务错误类型
 */
export class NotFoundError extends AppError {
  constructor(message: string = "资源未找到") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "请求参数验证失败") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "未授权访问") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "禁止访问") {
    super(message, 403);
  }
}

/**
 * 日程相关的错误消息常量
 */
export const SCHEDULE_ERRORS = {
  NOT_FOUND: "日程未找到",
  NEED_ID: "需要提供日程ID",
  INVALID_DATE: "日期格式无效",
  DEPENDENCY_CYCLE: "检测到依赖循环",
  UNAUTHORIZED_ACCESS: "无权访问此日程",
} as const;

/**
 * AI 相关的错误消息常量
 */
export const AI_ERRORS = {
  API_ERROR: "AI 服务调用失败",
  INVALID_RESPONSE: "AI 响应格式无效",
  TIMEOUT: "AI 服务响应超时",
} as const;
