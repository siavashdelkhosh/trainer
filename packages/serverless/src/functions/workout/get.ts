import { APIGatewayProxyResult, Context } from "aws-lambda";
import { HTTP_CODE, getWorkoutFromDb } from "../utils";
import { APIGatewayEvent } from "../../declarations";
import middy from "@middy/core";
import { remainingTime } from "../../library/utils";

export const getWorkout = async (event: APIGatewayEvent, context: Context) => {
  console.log(`AWS Request id: ${context.awsRequestId}`);

  const workoutId = event.pathParameters.id;
  // get workout from db
  const workout = await getWorkoutFromDb(workoutId);

  const response: APIGatewayProxyResult = {
    statusCode: HTTP_CODE.OK,
    body: JSON.stringify(workout),
  };
  return response;
};

export const handler = middy(getWorkout).use(remainingTime());
