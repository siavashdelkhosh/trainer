import { Context } from "aws-lambda";
import { APIGatewayEvent } from "../../declarations";
import middy from "@middy/core";
import { remainingTime } from "../../library/utils";

export const retrieveWorkouts = async (
  event: APIGatewayEvent,
  context: Context
) => {};

export const handler = middy(retrieveWorkouts).use(remainingTime());
