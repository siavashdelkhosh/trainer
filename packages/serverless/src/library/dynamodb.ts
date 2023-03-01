import https from "https";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import {
  DynamoDBClientConfig,
  DynamoDBClientResolvedConfig,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocument,
  DeleteCommand,
  GetCommand,
  ServiceInputTypes,
  ServiceOutputTypes,
  QueryCommandInput,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { Command } from "@aws-sdk/types";
import { backOff } from "exponential-backoff";
import { greaterThanTwoSeconds } from "./greaterThanTwoSeconds";
import { getDBClient } from "./utils";
import { getRemainingTime } from "./utils";

// If DynamoDB times out, we want it to fail quickly and retry again. We want the
// DynamoDB calls to timeout before Lambda and API Gateway timeout.
const HTTP_TIMEOUT = 2 * 1000;

// This lets you set an upper bound on the number of concurrent requests to a given origin at a time.
// Lowering this value can reduce the number of throttling or timeout errors received. However,
// it can also increase memory usage because requests are queued until a socket becomes available.
const HTTP_AGENT_SOCKETS = 20;

// The maximum amount of retries to attempt with a request.
const MAX_RETRIES = 2;

export type QueryCommandInputParams = Omit<QueryCommandInput, "TableName">;

/**
 * Wrap Dynamo Response in a common type.
 */
export type DynamoResponse = DynamoSuccessResponse | DynamoFailureResponse;

export interface DynamoSuccessResponse {
  success: true;
  body: { [key: string]: any };
}

export interface DynamoFailureResponse {
  success: false;
  body: { [key: string]: any };
  name: string;
}

const createDBError = (name: string) => {
  return {
    success: false,
    name,
    body: { message: "DynamoDB Error." },
  };
};

export enum DynamoErrorCode {
  ConditionalCheckFailedException = "ConditionalCheckFailedException",
  ThrottlingException = "ThrottlingException",
  ProvisionedThroughputExceededException = "ProvisionedThroughputExceededException",
  ValidationException = "ValidationException",
}

export const getDBConnection = (): DynamoDBDocument => {
  console.log("DynamoDB creating connection");

  const config: DynamoDBClientConfig = {
    apiVersion: "2012-08-10",
    region: process.env.DB_REGION,
    endpoint: process.env.DB_ADDRESS,
    credentials: {
      accessKeyId: process.env.DB_ACCESS_KEY!,
      secretAccessKey: process.env.DB_SECRET_KEY!,
    },
    maxAttempts: MAX_RETRIES,
    requestHandler: new NodeHttpHandler({
      socketTimeout: HTTP_TIMEOUT,
      connectionTimeout: HTTP_TIMEOUT,
    }),
  };

  // Endpoint is empty when running in AWS
  if (!config.endpoint) {
    return getDBClient({
      requestHandler: new NodeHttpHandler({
        httpsAgent: new https.Agent({
          maxSockets: HTTP_AGENT_SOCKETS,
          keepAlive: true,
        }),
      }),
    });
  }

  return getDBClient(config);
};

export const dbConnection = getDBConnection();

async function executeCommand<
  I extends ServiceInputTypes,
  O extends ServiceOutputTypes
>(
  command: Command<
    ServiceInputTypes,
    I,
    ServiceOutputTypes,
    O,
    DynamoDBClientResolvedConfig
  >
): Promise<DynamoResponse> {
  return {
    success: true,
    body: await dbConnection.send(command),
  };
}

const createBackOffOptions = (requestName: string) => {
  // BackOff options defaults
  const numOfAttempts = 4;
  const startingDelay = 50; // in milliseconds
  const timeMultiple = 2; // multiplier to increase the delay

  const is4xxError = (statusCode: number | undefined) =>
    statusCode && statusCode >= 400 && statusCode < 500;

  /**
   * Should retry original requests that receive server errors (5xx).
   * However, client errors (4xx, other than a ThrottlingException or a ProvisionedThroughputExceededException)
   * indicate that you need to revise the request itself to correct the problem before trying again.
   * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html#Programming.Errors.RetryAndBackoff
   */
  const shouldRetryRequest = (error: any, attemptedNumber: number) =>
    greaterThanTwoSeconds(getRemainingTime) &&
    attemptedNumber !== backOffOptions.numOfAttempts &&
    error.name !== DynamoErrorCode.ConditionalCheckFailedException &&
    error.name !== DynamoErrorCode.ValidationException &&
    (!is4xxError(error?.status) ||
      error.name === DynamoErrorCode.ThrottlingException);

  const backOffOptions = {
    numOfAttempts,
    startingDelay,
    timeMultiple,
    retry: (error: any, attemptedNumber: number) => {
      console.log({ type: `${requestName} request failed`, data: { error } });

      if (shouldRetryRequest(error, attemptedNumber)) {
        console.log(`Retrying ${requestName}`);
        return true;
      }

      if (
        error.name === DynamoErrorCode.ConditionalCheckFailedException ||
        error.name === DynamoErrorCode.ValidationException
      ) {
        console.warn(error);
      } else {
        console.error(error);
      }

      return false;
    },
  };

  return backOffOptions;
};

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html

async function executeCommandWithRetries<
  I extends ServiceInputTypes,
  O extends ServiceOutputTypes
>(
  command: Command<
    ServiceInputTypes,
    I,
    ServiceOutputTypes,
    O,
    DynamoDBClientResolvedConfig
  >
): Promise<DynamoResponse> {
  const commandType = command.constructor.name;
  const response = backOff(
    () => executeCommand(command),
    createBackOffOptions(`DynamoDB ${commandType}`)
  );
  return response;
}

export async function deleteItem(
  table: string,
  key: string
): Promise<DynamoResponse> {
  console.log("DynamoDB.execute.DeleteCommand");

  return executeCommandWithRetries(
    new DeleteCommand({
      TableName: table,
      Key: {
        id: key,
      },
      ConditionExpression: "attribute_exists(id)",
    })
  );
}

export async function putItem(
  table: string,
  item: object,
  condition?: string
): Promise<DynamoResponse> {
  console.log("DynamoDB.execute.PutCommand");

  try {
    return await executeCommandWithRetries(
      new PutCommand({
        TableName: table,
        Item: item,
        ...(condition && { ConditionExpression: condition }),
      })
    );
  } catch (error: any) {
    return createDBError(error.name);
  }
}

export async function getItem<T extends object>(
  table: string,
  value: string,
  consistentRead = true
): Promise<T> {
  console.log("DynamoDB.execute.GetCommand");

  const partitionKeyParameter = "id";

  let result: DynamoResponse;
  try {
    const command = new GetCommand({
      TableName: table,
      Key: { [partitionKeyParameter]: value },
      ConsistentRead: consistentRead,
    });

    result = await executeCommandWithRetries(command);
  } catch (error: any) {
    result = createDBError(error.name);
  }

  return result.success && result.body.Item ? result.body.Item : {};
}

export async function queryItems(
  table: string,
  params: QueryCommandInputParams
): Promise<DynamoResponse> {
  console.log("DynamoDB.execute.QueryCommand");

  try {
    return await executeCommandWithRetries(
      new QueryCommand({
        ...params,
        TableName: table,
      })
    );
  } catch (error: any) {
    return createDBError(error.name);
  }
}
