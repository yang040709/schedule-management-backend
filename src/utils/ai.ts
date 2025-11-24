import { openai } from "@/config/ai";
import { AI_ERRORS } from "./errors";

/**
 * 带重试机制的 AI API 调用
 * @param apiCall AI API 调用函数
 * @param maxRetries 最大重试次数，默认 3 次
 * @param baseDelay 基础延迟时间（毫秒），默认 1000ms
 * @returns API 调用结果
 */
export const callAIWithRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      console.warn(`AI API 调用失败 (尝试 ${attempt}/${maxRetries}):`, error);

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        break;
      }

      // 计算指数退避延迟时间
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`等待 ${delay}ms 后重试...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // 所有重试都失败后抛出错误
  throw new Error(
    `${AI_ERRORS.API_ERROR}: ${lastError?.message || "未知错误"}`
  );
};

/**
 * 创建 OpenAI 聊天完成请求
 * @param messages 聊天消息
 * @param model 模型名称，默认 "deepseek-chat"
 * @param maxRetries 最大重试次数
 * @returns 聊天完成结果
 */
export const createChatCompletionWithRetry = async (
  messages: any[],
  model: string = "deepseek-chat",
  maxRetries: number = 3
) => {
  return await callAIWithRetry(
    () =>
      openai.chat.completions.create({
        model,
        messages,
      }),
    maxRetries
  );
};

/**
 * 验证 AI 响应内容
 * @param content AI 响应内容
 * @returns 验证结果
 */
export const validateAIResponse = (content: string | null): string => {
  if (!content) {
    throw new Error(AI_ERRORS.INVALID_RESPONSE);
  }

  // 移除可能的代码块标记
  const cleanedContent = content.replace(/```json\s*|\s*```/g, "").trim();

  if (!cleanedContent) {
    throw new Error(AI_ERRORS.INVALID_RESPONSE);
  }

  return cleanedContent;
};
