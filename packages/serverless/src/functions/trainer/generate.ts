import { Context } from "aws-lambda";
import { APIGatewayEvent } from "../../declarations";
import { TrainingPlanRequestType } from "../../models";
import middy from "@middy/core";

export const generatePlan = async (
  event: APIGatewayEvent<TrainingPlanRequestType>,
  context: Context
) => {};

export const handler = middy(generatePlan);
