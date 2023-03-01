import { WorkoutRequestType } from "../../models";

export const createWorkoutData = (body: WorkoutRequestType, id: string) => {
  return {
    body,
    id,
  };
};
