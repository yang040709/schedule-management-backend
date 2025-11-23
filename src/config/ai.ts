import OpenAI from "openai";

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY未设置");
}

console.log("process.env.DEEPSEEK_API_KEY", process.env.DEEPSEEK_API_KEY);
export const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});
