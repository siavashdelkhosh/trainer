import { APIGatewayProxyEvent } from "aws-lambda";

export interface APIGatewayEvent<
  TBody = object,
  TPathParameters = Record<string, string>,
  THeaders = Record<string, string>
> extends Omit<APIGatewayProxyEvent, "body" | "pathParameters" | "headers"> {
  readonly body: TBody;
  readonly pathParameters: TPathParameters;
  readonly headers: THeaders;
}
