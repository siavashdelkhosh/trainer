import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

export * from "./getRemainingTime";

export const getDBClient = (options: DynamoDBClientConfig = {}) => {
  return DynamoDBDocument.from(new DynamoDB(options), {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
};
