import { openai } from "@/config/ai";
import ScheduleModel from "@/model/Schedule";
import {
  ModifyScheduleForm,
  Schedule,
  ScheduleDocument,
  ScheduleForm,
  ScheduleListQuery,
} from "@/types/schedule";

export const addSchedule = async (
  scheduleForm: ScheduleForm,
  userId: string
) => {
  try {
    console.log(scheduleForm, "<==add");
    const schedule = await ScheduleModel.create({
      title: scheduleForm.title,
      description: scheduleForm.description,
      priority: scheduleForm.priority,
      category: scheduleForm.category,
      dependentId: scheduleForm.dependentId,
      timeOfDay: scheduleForm.timeOfDay,
      date: scheduleForm.date,
      status: "pending",
      userId,
    });
    await schedule.save();
    return schedule;
  } catch (error) {
    console.log(error, "<==error");
    throw error;
  }
};

export const getScheduleList = async (
  query: ScheduleListQuery,
  userId: string
) => {
  // 构建基础查询条件（只包含有值的字段）
  const conditions: any = {};

  if (query.status !== undefined) {
    conditions.status = query.status;
  }
  if (query.priority !== undefined) {
    conditions.priority = query.priority;
  }
  if (query.date !== undefined) {
    conditions.date = query.date;
  }

  // 处理日期范围查询（关键！）
  if (query.dateRange) {
    conditions.date = {
      $gte: query.dateRange.startDate,
      $lte: query.dateRange.endDate,
    };
  }
  conditions.userId = userId;
  let scheduleResult = ScheduleModel.find(conditions);

  // 分页处理
  if (query.page && query.pageSize) {
    scheduleResult = scheduleResult
      .skip(query.pageSize * (query.page - 1))
      .limit(query.pageSize);
  }

  const scheduleList = await scheduleResult;
  /* 
    把列表的依赖的任务也查询出来
  */

  const finalScheduleList: Schedule[] = [];

  if (scheduleList.length > 0) {
    let dependentScheduleIds = scheduleList.map((item) => {
      console.log(item, "item");
      return item.dependentId;
    });
    console.log("dependentScheduleIds", dependentScheduleIds);
    dependentScheduleIds = dependentScheduleIds.filter((id) => id);
    const dependentSchedules = await ScheduleModel.find({
      id: { $in: dependentScheduleIds },
      userId,
    });
    console.log(dependentSchedules, "<==dependentSchedules");
    scheduleList.forEach((item) => {
      finalScheduleList.push({
        ...item.toObject(),
        dependentSchedule: dependentSchedules.find(
          (dep) => dep.id === item.dependentId
        ),
      });
    });
  }
  console.log(finalScheduleList, "<==finalScheduleList");
  return finalScheduleList;
};

export const modifySchedule = async (
  id: string,
  updateData: ModifyScheduleForm,
  userId: string
) => {
  const saveKeyList = [
    "title",
    "description",
    "AIsuggestion",
    "status",
    "priority",
    "category",
    "dependentId",
    "date",
    "timeOfDay",
  ];

  // 1. 过滤掉 undefined/null 值（保留原始值）和无效的key值
  const cleanedUpdate = Object.fromEntries(
    Object.entries(updateData)
      .filter(([_, v]) => v !== undefined && v !== null)
      .filter(([k]) => saveKeyList.includes(k))
  );

  // // 2. 特殊处理 dependentId → 转换为 dependentSchedule 引用
  // if ("dependentId" in cleanedUpdate) {
  //   const { dependentId, ...rest } = cleanedUpdate;
  //   cleanedUpdate.dependentSchedule = dependentId || null; // null 表示解除依赖
  //   // 注意：这里假设你的 Schema 中 dependentSchedule 实际存储的是 ID
  // }
  if (updateData.status && updateData.status === "done") {
    /* 
      当修改的状态是done时，需要更新所有依赖它的任务的状态也变成pending,就是解锁了
    */
    await ScheduleModel.updateMany(
      { dependentId: id },
      { $set: { status: "pending" } }
    );
  }
  /* 
      当修改的状态是pending时，需要更新所有依赖它的任务的状态也变成locked,就是锁定了
  */
  if (updateData.status && updateData.status === "pending") {
    await ScheduleModel.updateMany(
      { dependentId: id },
      { $set: { status: "locked" } }
    );
  }

  // 3. 执行更新
  const updated = await ScheduleModel.findOneAndUpdate(
    {
      id,
      userId,
    },
    { $set: cleanedUpdate },
    { new: true, runValidators: true }
  );

  return updated;
};

export const deleteSchedule = async (id: string, userId: string) => {
  if (!id) {
    throw new Error("NOT_FOUND");
  }
  const deleted = await ScheduleModel.findOneAndDelete({
    id,
    userId,
  });
  console.log(deleted, "<==deleted");
  return deleted;
};

const createSuggestUserPrompt = (schedule: ScheduleDocument) => {
  const userPrompt = `日程详情如下：
标题：${schedule.title}
描述：${schedule.description || "无"}
日期：${schedule.date}
时间：${
    schedule.timeOfDay
      ? `${schedule.timeOfDay.startTime} - ${schedule.timeOfDay.endTime}`
      : "未指定"
  }
状态：${schedule.status}
优先级：${schedule.priority}
分类：${schedule.category?.join("、") || "未分类"}
`;
  return userPrompt;
};

const suggestSystemPrompt = `你是一位高效能个人助理，专门帮助用户优化日程安排。请根据用户提供的日程信息，生成一条简洁、实用、可操作的建议（不超过100字）。建议应聚焦于以下一个或多个方面：
- 时间安排是否合理
- 优先级是否匹配任务重要性
- 是否缺少必要信息（如地点、参与人）
- 如何提升执行效率或减少压力
- 更重要的是提供行动建议，告诉用户如何更好地执行任务，用户需要注意什么，用户可以通过什么提高完成日程的效率

请用中文回复，语气专业而友好，避免使用“建议”“你可以”等冗余开头，直接给出行动导向的语句。`;

export const generateAISuggest = async (id: string, userId: string) => {
  if (!id) {
    throw new Error("NEED_ID");
  }
  const schedule = await ScheduleModel.findOne({ id });
  if (!schedule) {
    throw new Error("NOT_FOUND");
  }
  const userPrompt = createSuggestUserPrompt(schedule);
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: suggestSystemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });
  const suggestion = completion.choices[0].message.content;
  await modifySchedule(id, { AIsuggestion: suggestion }, userId);
  console.log("completion", suggestion);
  return suggestion;
};

export const generateAISuggestByEdit = async (
  id: string,
  from: ModifyScheduleForm,
  userId: string
) => {
  if (!id) {
    throw new Error("NEED_ID");
  }
  const schedule = await ScheduleModel.findOne({ id });
  if (!schedule) {
    throw new Error("NOT_FOUND");
  }
  const newSchedule = {
    ...schedule,
    ...from,
  };
  const userPrompt = createSuggestUserPrompt(newSchedule);
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: suggestSystemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });
  const suggestion = completion.choices[0].message.content;
  return suggestion;
};

const scheduleSystemPrompt = `你是一个智能日程解析器。请根据用户输入的自然语言描述，提取并生成一个严格符合以下 TypeScript 接口的 JSON 对象：

interface ScheduleForm {
  title: string;                    // 必填，简洁概括任务名称，不超过20字
  description: string;              // 必填，不可为空字符串。你根据用户的输入，描述任务内容,不要出现“用户说XX时间干什么”，直接以用户的人称输出就可以。
  priority: "low" | "medium" | "high"; // 必填，根据语境判断：含“紧急”“重要”“必须”等视为 high；含“随便”“有空再做”视为 low；其余默认 medium
  category?: string[];              // 可选，从 ["工作", "学习", "生活", "健康", "家庭", "其他"] 中选择最相关的1-2项；无法判断则省略该字段
  timeOfDay?: {                     // 若提到具体时间段（如“9点到10点”），则必填；否则省略
    startTime: string;              // 格式必须为 "HH:mm"（24小时制，补零），例如 "09:00"
    endTime: string;                // 同上，必须晚于 startTime
  };
  date: string;                     // 必填，格式必须为 "YYYY-MM-DD"。参考当前日期：${
    new Date().toISOString().split("T")[0]
  }
}

## 输出规则：
1. **只输出纯 JSON 对象**，不要包含任何解释、Markdown、代码块（如 \`\`\`json）或额外文本。
2. 所有字段必须符合上述类型和格式要求。
3. 若用户未提及时段，不要猜测或填充 timeOfDay。
4. 日期需正确解析相对时间（如“明天”“下周一”），并转换为绝对日期。
5. 时间必须标准化为 24 小时制，补前导零（如 "9:00" → "09:00"）。
6. 若无法解析关键信息（如日期），仍需返回合法 JSON，并尽可能填充可推断字段，缺失部分按规则设为空或默认值。

现在，请解析以下用户输入：`;

export const generateSchedule = async (content: string, userId: string) => {
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: scheduleSystemPrompt,
      },
      {
        role: "user",
        content: content,
      },
    ],
  });
  const scheduleStr = completion.choices[0].message.content;
  // return suggestion;
  const schedule = JSON.parse(scheduleStr) as ScheduleDocument;
  console.log(schedule);
  return schedule;
};
