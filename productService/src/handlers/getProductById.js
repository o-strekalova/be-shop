import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import httpEventNormalizer from "@middy/http-event-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";
import { dynamo } from "../db/dynamoDBClient.js";

const query = async (id, tableName, idProp) => {
  const queryResults = await dynamo.query({
    TableName: tableName,
    KeyConditionExpression: idProp + ' = :id',
    ExpressionAttributeValues: {':id': id}
  }).promise();

  return queryResults.Items;
}

export const getProductById = async (productId) => {
  const existingProduct = await query(productId, process.env.productsTable, 'id');

  if (!existingProduct.length) {
    throw generateProductNotFoundError(productId);
  }

  const existingStock = await query(productId, process.env.stocksTable, 'productId');

  if (!existingStock.length) {
    throw generateStockNotFoundError(productId);
  }

  return {
    ...existingProduct[0],
    count: existingStock[0].count,
  }
}

export const generateProductNotFoundError = (productId) =>
  new createError.NotFound(`Product with id '${productId}' was not found`);

export const generateStockNotFoundError = (productId) =>
  new createError.NotFound(`Stock for product with id '${productId}' was not found`);

export const lambdaHandler = async (event) => {
  console.log(`getProductById event - ${event}`);

  const { productId } = event.pathParameters;
  const product = await getProductById(productId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      product,
    }),
  };
};

const schema = {
  type: "object",
  required: ["pathParameters"],
  properties: {
    pathParameters: {
      type: "object",
      required: ["productId"],
      properties: {
        productId: {
          type: "string",
        },
      },
    },
  },
};

export default middy()
  .use(errorLogger())
  .use(
    httpCors({
      origins: CORS_ORIGINS_WHITE_LIST,
    })
  )
  .use(httpEventNormalizer())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
