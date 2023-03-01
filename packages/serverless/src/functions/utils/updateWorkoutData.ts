import { putItem } from "../../library";
import { WorkoutRequestType } from "../../models";

export const updateWorkoutData = async (
  workout: WorkoutRequestType
): Promise<boolean> => {
  const response = await putItem(
    "some-table-name",
    workout,
    "attribute_exists(id)"
  );

  if (response.success) {
    console.log("successfully updated workout");
    return true;
  }

  console.log(
    `failed to update the workout, response: ${JSON.stringify(response)}`
  );

  return false;
};
