import type {Schedule} from '../types/schedule'

export const scheduleList :Schedule[] = [
  {
    id: 'sch-001',
    title: '团队周会',
    description: '讨论本周进度与下周计划',
    AIsuggestion: '建议提前准备项目进度报告',
    status: 'pending',
    priority: 'high',
    category: ['会议', '团队'],
    scheduleType: "daily",
    recurrence: {
      startDate: '2025-11-17',
      endDate: '2025-12-29'
    },
    timeOfDay: {
      startTime: '10:00',
      endTime: '11:30'
    },
    createdAt: '2025-11-14T09:30:00Z',
    updatedAt: '2025-11-14T09:30:00Z'
  },
  {
    id: 'sch-002',
    title: '客户提案演示',
    description: '向ABC公司展示新产品方案',
    status: 'pending',
    priority: 'high',
    category: ['会议', '客户'],
    dependentId: 'sch-003',
    scheduleType: 'single',
    singleDate: '2025-11-20',
    timeOfDay: {
      startTime: '14:00',
      endTime: '15:30'
    },
    createdAt: '2025-11-14T10:15:00Z',
    updatedAt: '2025-11-14T10:15:00Z'
  },
  {
    id: 'sch-003',
    title: '提案材料准备',
    description: '完成ABC公司提案的PPT和文档',
    AIsuggestion: '建议重点突出成本优势和实施周期',
    status: 'in-progress',
    priority: 'high',
    category: ['工作', '准备'],
    scheduleType: 'single',
    singleDate: '2025-11-19',
    timeOfDay: {
      startTime: '09:00',
      endTime: '18:00'
    },
    createdAt: '2025-11-14T10:18:00Z',
    updatedAt: '2025-11-14T16:45:00Z'
  },
  {
    id: 'sch-004',
    title: '晨跑锻炼',
    description: '小区周边慢跑30分钟',
    status: 'pending',
    priority: 'medium',
    category: ['健康', '运动'],
    scheduleType: 'daily',
    recurrence: {
      startDate: '2025-11-15',
      endDate: '2025-11-30'
    },
    timeOfDay: {
      startTime: '06:30',
      endTime: '07:00'
    },
    createdAt: '2025-11-14T20:30:00Z',
    updatedAt: '2025-11-14T20:30:00Z'
  },
  {
    id: 'sch-005',
    title: '项目代码评审',
    description: '审核前端组件库重构代码',
    status: 'pending',
    priority: 'medium',
    category: ['工作', '技术'],
    scheduleType: 'single',
    singleDate: '2025-11-16',
    timeOfDay: {
      startTime: '13:00',
      endTime: '15:00'
    },
    createdAt: '2025-11-14T11:20:00Z',
    updatedAt: '2025-11-14T11:20:00Z'
  },
  {
    id: 'sch-006',
    title: '购买生日礼物',
    description: '为妈妈准备60岁生日礼物',
    AIsuggestion: '考虑珠宝或保健品，提前包装',
    status: 'pending',
    priority: 'medium',
    category: ['生活', '家庭'],
    scheduleType: 'single',
    singleDate: '2025-11-25',
    createdAt: '2025-11-14T14:50:00Z',
    updatedAt: '2025-11-14T14:50:00Z'
  },
  {
    id: 'sch-007',
    title: '英语口语练习',
    description: '与外教进行1对1会话练习',
    status: 'pending',
    priority: 'low',
    category: ['学习', '语言'],
    scheduleType: 'daily',
    recurrence: {
      startDate: '2025-11-18',
      endDate: '2026-02-18'
    },
    timeOfDay: {
      startTime: '20:00',
      endTime: '21:00'
    },
    createdAt: '2025-11-14T16:20:00Z',
    updatedAt: '2025-11-14T16:20:00Z'
  },
  {
    id: 'sch-008',
    title: '部门季度总结',
    description: '整理本季度部门业绩数据',
    status: 'in-progress',
    priority: 'high',
    category: ['工作', '总结'],
    scheduleType: 'single',
    singleDate: '2025-11-30',
    timeOfDay: {
      startTime: '09:00',
      endTime: '17:00'
    },
    createdAt: '2025-11-13T15:40:00Z',
    updatedAt: '2025-11-14T11:30:00Z'
  },
  {
    id: 'sch-009',
    title: '超市采购',
    description: '购买下周食材和日用品',
    status: 'pending',
    priority: 'medium',
    category: ['生活', '购物'],
    scheduleType: 'daily',
    recurrence: {
      startDate: '2025-11-16',
      endDate: '2025-12-28'
    },
    timeOfDay: {
      startTime: '19:00',
      endTime: '20:30'
    },
    createdAt: '2025-11-14T18:30:00Z',
    updatedAt: '2025-11-14T18:30:00Z'
  },
  {
    id: 'sch-010',
    title: '牙医预约',
    description: '年度牙齿检查和清洁',
    status: 'pending',
    priority: 'medium',
    category: ['健康', '医疗'],
    scheduleType: 'single',
    singleDate: '2025-12-05',
    timeOfDay: {
      startTime: '15:30',
      endTime: '16:30'
    },
    createdAt: '2025-11-14T09:10:00Z',
    updatedAt: '2025-11-14T09:10:00Z'
  },
  {
    id: 'sch-011',
    title: '产品发布会筹备',
    description: '协调场地、设备和嘉宾邀请',
    AIsuggestion: '建议制作详细倒计时表，分配任务',
    status: 'in-progress',
    priority: 'high',
    category: ['工作', '活动'],
    dependentId: 'sch-012',
    scheduleType: 'daily',
    recurrence: {
      startDate: '2025-11-15',
      endDate: '2025-12-10'
    },
    timeOfDay: {
      startTime: '14:00',
      endTime: '17:00'
    },
    createdAt: '2025-11-12T10:20:00Z',
    updatedAt: '2025-11-14T14:30:00Z'
  },
  {
    id: 'sch-012',
    title: '产品发布会',
    description: '新产品正式发布仪式',
    status: 'pending',
    priority: 'high',
    category: ['工作', '活动'],
    scheduleType: 'single',
    singleDate: '2025-12-11',
    timeOfDay: {
      startTime: '10:00',
      endTime: '12:00'
    },
    createdAt: '2025-11-12T10:25:00Z',
    updatedAt: '2025-11-12T10:25:00Z'
  },
  {
    id: 'sch-013',
    title: '阅读时间',
    description: '阅读《深度学习入门》第5-7章',
    status: 'pending',
    priority: 'low',
    category: ['学习', '技术'],
    scheduleType: 'single',
    singleDate: '2025-11-17',
    timeOfDay: {
      startTime: '21:00',
      endTime: '22:30'
    },
    createdAt: '2025-11-14T20:45:00Z',
    updatedAt: '2025-11-14T20:45:00Z'
  },
  {
    id: 'sch-014',
    title: '水电费缴纳',
    description: '支付11月份水电燃气费用',
    status: 'pending',
    priority: 'medium',
    category: ['生活', '账单'],
    scheduleType: 'single',
    singleDate: '2025-11-25',
    createdAt: '2025-11-14T11:50:00Z',
    updatedAt: '2025-11-14T11:50:00Z'
  },
  {
    id: 'sch-015',
    title: '代码提交审查',
    description: '检查团队成员提交的代码质量',
    status: 'done',
    priority: 'medium',
    category: ['工作', '技术'],
    scheduleType: 'daily',
    recurrence: {
      startDate: '2025-11-01',
      endDate: '2025-11-14'
    },
    timeOfDay: {
      startTime: '16:00',
      endTime: '17:30'
    },
    createdAt: '2025-11-01T08:30:00Z',
    updatedAt: '2025-11-14T17:30:00Z'
  },
  {
    id: 'sch-016',
    title: '朋友聚餐',
    description: '与大学同学聚会，讨论近况',
    status: 'pending',
    priority: 'low',
    category: ['生活', '社交'],
    scheduleType: 'single',
    singleDate: '2025-11-22',
    timeOfDay: {
      startTime: '18:30',
      endTime: '21:00'
    },
    createdAt: '2025-11-14T13:20:00Z',
    updatedAt: '2025-11-14T13:20:00Z'
  },
  {
    id: 'sch-017',
    title: '健身课程',
    description: '参加瑜伽塑形课程',
    AIsuggestion: '建议提前15分钟到达，做好热身',
    status: 'pending',
    priority: 'low',
    category: ['健康', '运动'],
    scheduleType: 'daily',
    recurrence: {
      startDate: '2025-11-18',
      endDate: '2025-12-30'
    },
    timeOfDay: {
      startTime: '19:00',
      endTime: '20:00'
    },
    createdAt: '2025-11-14T18:10:00Z',
    updatedAt: '2025-11-14T18:10:00Z'
  },
  {
    id: 'sch-018',
    title: '系统维护',
    description: '服务器例行维护与数据备份',
    status: 'pending',
    priority: 'high',
    category: ['工作', '技术'],
    scheduleType: 'single',
    singleDate: '2025-11-23',
    timeOfDay: {
      startTime: '00:00',
      endTime: '02:00'
    },
    createdAt: '2025-11-14T10:45:00Z',
    updatedAt: '2025-11-14T10:45:00Z'
  },
  {
    id: 'sch-019',
    title: '写博客',
    description: '发布关于前端性能优化的文章',
    status: 'pending',
    priority: 'low',
    category: ['学习', '分享'],
    scheduleType: 'single',
    singleDate: '2025-11-30',
    timeOfDay: {
      startTime: '15:00',
      endTime: '17:00'
    },
    createdAt: '2025-11-14T16:50:00Z',
    updatedAt: '2025-11-14T16:50:00Z'
  },
  {
    id: 'sch-020',
    title: '整理邮箱',
    description: '清理收件箱，分类重要邮件',
    status: 'expired',
    priority: 'low',
    category: ['工作', '整理'],
    scheduleType: 'single',
    singleDate: '2025-11-10',
    timeOfDay: {
      startTime: '14:00',
      endTime: '15:00'
    },
    createdAt: '2025-11-09T11:20:00Z',
    updatedAt: '2025-11-10T18:00:00Z'
  }
];