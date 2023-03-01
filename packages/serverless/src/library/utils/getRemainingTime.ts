import { Context } from "aws-lambda";
import middy from "@middy/core";
let context: Context;

export const getRemainingTime = () => {
  return context.getRemainingTimeInMillis();
};

export const remainingTime = () => {
  return {
    before: (request: middy.Request) => {
      context = request.context;
    },
  };
};
