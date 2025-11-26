import ScheduleModel from "../model/Schedule";
import { DashboardStats } from "../types/stat";
import { cacheService, CACHE_KEYS } from "../utils/cache";

/**
 * 获取用户仪表盘统计数据
 * @param userId 用户ID
 * @returns 仪表盘统计数据
 */
export const getDashboardStats = async (
  userId: string
): Promise<DashboardStats> => {
  // 生成缓存键

  const cacheKey = `${CACHE_KEYS.DASHBOARD_STATS}:${userId}`;
  // // 尝试从缓存获取
  const cachedResult = await cacheService.get<DashboardStats>(cacheKey);
  if (cachedResult) {
    console.log("Cache hit for dashboard stats");
    return cachedResult;
  }

  console.log("Cache miss for dashboard stats, querying database");

  // 获取当前日期
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // 获取最近7天的日期范围
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 并行执行所有统计查询
  const [
    totalSchedules,
    todaySchedules,
    todayCompleted,
    statusDistribution,
    priorityDistribution,
    categoryDistribution,
    trendData,
  ] = await Promise.all([
    // 日程总数
    ScheduleModel.countDocuments({ userId }),

    // 今日日程
    ScheduleModel.countDocuments({
      userId,
      date: { $gte: todayStart, $lte: todayEnd },
    }),

    // 今日完成
    ScheduleModel.countDocuments({
      userId,
      date: { $gte: todayStart, $lte: todayEnd },
      status: "done",
    }),

    // 状态分布
    ScheduleModel.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // 优先级分布
    ScheduleModel.aggregate([
      { $match: { userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),

    // 分类占比
    ScheduleModel.aggregate([
      { $match: { userId } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
    ]),

    // 状态趋势数据（最近7天）
    ScheduleModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sevenDaysAgo, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // 计算完成率
  const completionRate =
    totalSchedules > 0
      ? `${Math.round((todayCompleted / totalSchedules) * 100)}%`
      : "0%";

  // 构建概览数据
  const overview = [
    {
      title: "今日日程",
      count: todaySchedules,
    },
    {
      title: "今日完成",
      count: todayCompleted,
    },
    {
      title: "日程总数",
      count: totalSchedules,
    },
    {
      title: "所有日程完成率",
      count: completionRate,
    },
  ];

  // 构建状态分布数据
  const statusMap: Record<string, number> = {
    pending: 0,
    done: 0,
    expired: 0,
    canceled: 0,
    locked: 0,
  };

  statusDistribution.forEach((item) => {
    statusMap[item._id] = item.count;
  });

  const status = [
    { name: "未完成", value: statusMap.pending },
    { name: "已完成", value: statusMap.done },
    { name: "已过期", value: statusMap.expired },
    { name: "已取消", value: statusMap.canceled },
    { name: "已锁定", value: statusMap.locked },
  ];

  // 构建优先级分布数据
  const priorityMap: Record<string, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };

  priorityDistribution.forEach((item) => {
    priorityMap[item._id] = item.count;
  });

  const priority = [
    { title: "高优先级", value: priorityMap.high },
    { title: "中优先级", value: priorityMap.medium },
    { title: "低优先级", value: priorityMap.low },
  ];

  // 构建分类占比数据
  const totalCategoryCount = categoryDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const category = categoryDistribution.map((item) => ({
    name: item._id || "未分类",
    value:
      totalCategoryCount > 0
        ? Number(((item.count / totalCategoryCount) * 100).toFixed(2))
        : 0,
  }));

  // 构建状态趋势数据
  const allTrendData: number[] = [];
  const uncompletedTrendData: number[] = [];
  const completedTrendData: number[] = [];
  const xAxis: string[] = [];

  // 生成最近7天的日期
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    xAxis.push(dateStr);

    // 查找该日期的数据
    const dayData = trendData.find((item) => item._id === dateStr);

    if (dayData) {
      const allCount = dayData.statusCounts.reduce(
        (sum: number, statusItem: any) => sum + statusItem.count,
        0
      );
      const uncompletedCount = dayData.statusCounts
        .filter((statusItem: any) => statusItem.status === "pending")
        .reduce((sum: number, statusItem: any) => sum + statusItem.count, 0);
      const completedCount = dayData.statusCounts
        .filter((statusItem: any) => statusItem.status === "done")
        .reduce((sum: number, statusItem: any) => sum + statusItem.count, 0);

      allTrendData.push(allCount);
      uncompletedTrendData.push(uncompletedCount);
      completedTrendData.push(completedCount);
    } else {
      allTrendData.push(0);
      uncompletedTrendData.push(0);
      completedTrendData.push(0);
    }
  }

  const statusTrend = {
    all: allTrendData,
    uncompleted: uncompletedTrendData,
    completed: completedTrendData,
    xAxis,
  };

  // 构建最终结果
  const result: DashboardStats = {
    overview,
    status,
    statusTrend,
    priority,
    category,
  };

  // 缓存结果，TTL 设置为 10 分钟
  await cacheService.set(cacheKey, result, 600);

  return result;
};
