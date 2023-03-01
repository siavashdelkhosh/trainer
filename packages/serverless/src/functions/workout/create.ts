import { APIGatewayProxyResult, Context } from "aws-lambda";

import { nanoid } from "nanoid/async";
import { params } from "../../params";
import { HTTP_CODE, createWorkoutData } from "../utils";
import { WorkoutRequestType } from "../../models";
import { APIGatewayEvent } from "../../declarations";
import middy from "@middy/core";
import { remainingTime } from "../../library/utils";
import { putItem } from "../../library";

const makeWorkoutId = async () => `wk_${await nanoid(params.idHashLength)}`;

export const createWorkout = async (
  event: APIGatewayEvent<WorkoutRequestType>,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const workoutEventBody = JSON.parse(JSON.stringify(event.body));
    console.log(context.awsRequestId);
    console.log("This is the event", event);
    console.log("#####################################");

    const workoutId = await makeWorkoutId();
    console.log("This is the workoutId", workoutId);
    console.log("#####################################");

    // create the workout
    const workout = createWorkoutData(workoutEventBody, workoutId);

    // Add the workout to the dynamodb
    await putItem("Simple-table", workout, "attribute_not_exists(id)");

    const response: APIGatewayProxyResult = {
      statusCode: HTTP_CODE.CREATED,
      body: JSON.stringify(workout),
    };
    return response;
  } catch (error) {
    const response: APIGatewayProxyResult = {
      statusCode: 500,
      body: JSON.stringify(error),
    };
    return response;
  }
};

export const handler = middy(createWorkout).use(remainingTime());
