import { APIGatewayEvent } from "../../declarations";
import middy from "@middy/core";
import { remainingTime } from "../../library/utils";
import { HTTP_CODE, updateWorkoutData } from "../utils";
import { APIGatewayProxyResult, Context } from "aws-lambda";

export const updateWorkout = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`AWS Request id: ${context}`);
  const updatedWorkoutEventBody = JSON.parse(JSON.stringify(event.body));

  const updateWorkout = await updateWorkoutData(updatedWorkoutEventBody);

  const response: APIGatewayProxyResult = {
    statusCode: HTTP_CODE.OK,
    body: JSON.stringify(updateWorkout),
  };

  return response;
};

export const handler = middy(updateWorkout).use(remainingTime());
