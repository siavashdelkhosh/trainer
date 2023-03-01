import { deleteItem } from "../../library";

export const deleteWorkoutFromDb = async (workoutId: string) => {
  const response = await deleteItem("some-table-name", workoutId);
  if (response.success) return true;

  throw new Error(
    `failed to delete item from db, response: ${JSON.stringify(response.body)}`
  );
};
