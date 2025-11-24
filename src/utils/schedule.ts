import ScheduleModel from "@/model/Schedule";
import { Schedule, ScheduleDocument } from "@/types/schedule";

/**
 * 将 ScheduleDocument 转换为 Schedule 对象
 * 包含依赖日程信息的处理
 */
export const convertScheduleDocumentToSchedule = async (
  scheduleDocuments: ScheduleDocument[],
  userId: string
): Promise<Schedule[]> => {
  const finalScheduleList: Schedule[] = [];

  if (scheduleDocuments.length === 0) {
    return finalScheduleList;
  }

  // 收集所有依赖的日程ID
  const dependentScheduleIds = scheduleDocuments
    .map((item) => item.dependentId)
    .filter((id): id is string => !!id);

  // 一次性查询所有依赖的日程
  const dependentSchedules =
    dependentScheduleIds.length > 0
      ? await ScheduleModel.find({
          id: { $in: dependentScheduleIds },
          userId,
        })
      : [];

  // 转换每个日程文档
  scheduleDocuments.forEach((item) => {
    const dependentSchedule = dependentSchedules.find(
      (dep) => dep.id === item.dependentId
    );

    finalScheduleList.push({
      id: item.id,
      title: item.title,
      description: item.description,
      AIsuggestion: item.AIsuggestion,
      status: item.status,
      priority: item.priority,
      category: item.category,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      date: item.date,
      timeOfDay: item.timeOfDay,
      dependentSchedule: dependentSchedule
        ? {
            id: dependentSchedule.id,
            title: dependentSchedule.title,
            description: dependentSchedule.description,
            AIsuggestion: dependentSchedule.AIsuggestion,
            status: dependentSchedule.status,
            priority: dependentSchedule.priority,
            category: dependentSchedule.category,
            createdAt: dependentSchedule.createdAt,
            updatedAt: dependentSchedule.updatedAt,
            date: dependentSchedule.date,
            timeOfDay: dependentSchedule.timeOfDay,
          }
        : undefined,
    });
  });

  return finalScheduleList;
};

/**
 * 获取单个日程的完整流程链（包括父链和子链）
 */
export const getScheduleFlowChain = async (
  id: string,
  userId: string
): Promise<Schedule[]> => {
  const scheduleList: ScheduleDocument[] = [];

  // 获取起始日程
  const startSchedule = await ScheduleModel.findOne({ id, userId });
  if (!startSchedule) {
    throw new Error("日程未找到");
  }

  // 1. 获取父链（当前任务依赖的任务链）
  let currentSchedule = startSchedule;
  const parentChain: ScheduleDocument[] = [];

  // 沿着依赖链向上收集父任务
  while (currentSchedule.dependentId) {
    currentSchedule = await ScheduleModel.findOne({
      id: currentSchedule.dependentId,
      userId,
    });
    if (currentSchedule) {
      parentChain.unshift(currentSchedule); // 从头部插入，保持正确的顺序
    }
  }

  // 2. 获取子链（依赖当前任务的任务链）
  const childChain: ScheduleDocument[] = [];

  // 查找所有直接依赖当前任务的任务
  let directChildren = await ScheduleModel.find({
    dependentId: id,
    userId,
  });

  // 递归查找所有间接依赖的任务
  const visited = new Set<string>();
  const queue = [...directChildren];

  while (queue.length > 0) {
    const child = queue.shift()!;
    if (visited.has(child.id)) continue;

    visited.add(child.id);
    childChain.push(child);

    // 查找依赖这个子任务的任务
    const grandChildren = await ScheduleModel.find({
      dependentId: child.id,
      userId,
    });
    queue.push(...grandChildren);
  }

  // 3. 合并完整的流程链：父链 + 当前任务 + 子链
  scheduleList.push(...parentChain, startSchedule, ...childChain);

  // 转换整个流程链
  return await convertScheduleDocumentToSchedule(scheduleList, userId);
};
