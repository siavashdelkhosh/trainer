import { Context } from "aws-lambda";
import { APIGatewayEvent } from "../../declarations";
import middy from "@middy/core";
import { remainingTime } from "../../library/utils";
import { deleteWorkoutFromDb } from "../utils/";

export const deleteWorkout = async (
  event: APIGatewayEvent,
  context: Context
): Promise<string> => {
  console.log(`AWS Request id: ${context.awsRequestId}`);
  const workoutId = event.pathParameters.id;

  await deleteWorkoutFromDb(workoutId);

  return "OK";
};

export const handler = middy(deleteWorkout).use(remainingTime());
