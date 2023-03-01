import { getItem } from "../../library";
import { WorkoutResponseType } from "../../models";

export const getWorkoutFromDb = async (
  workoutId: string
): Promise<WorkoutResponseType> => {
  const workout = await getItem<WorkoutResponseType>(
    "some-table-name",
    workoutId
  );

  return workout;
};
