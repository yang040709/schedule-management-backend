import ScheduleModel from "@/model/Schedule";
import { ScheduleDocument } from "@/types/schedule";
export const exportSchedule = async (userId: string) => {
  return await ScheduleModel.find({ userId });
};

export const importSchedule = async (
  data: ScheduleDocument[],
  userId: string
) => {
  // console.log(data);
  const schedules = data.map((schedule) => {
    return {
      ...schedule,
      userId,
    };
  });
  return await ScheduleModel.insertMany(schedules);
};
