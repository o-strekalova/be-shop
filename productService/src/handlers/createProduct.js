import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import httpErrorHandler from "@middy/http-error-handler";
import { v4 as uuidv4 } from "uuid";
import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";
import { dynamo } from "../db/dynamoDBClient.js";
import { getProductById } from "./getProductById.js";

export const id = {
  generateId: uuidv4,
}

export const lambdaHandler = async (event) => {
  console.log(`createProduct request - ${event}`);

  const newId = id.generateId();

  await dynamo.transactWrite({
    TransactItems: [
      {
        Put: {
          Item: {
            id: newId,
            description: event.body.description,
            price: event.body.price,
            title: event.body.title
          },          
          TableName: process.env.productsTable,
        }
      }, 
      {
        Put: {
          Item: {
            productId: newId,
            count: event.body.count
          },
          TableName: process.env.stocksTable,
        }
      }
    ]
  }).promise();

  const product = await getProductById(newId);

  return {
    statusCode: 201,
    body: JSON.stringify({
      product,
    }),
  };
};

const schema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["title", "description", "price", "count"],
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: "string",
        },
        price: {
          type: "number",
        },
        count: {
          type: "number",
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
  .use(httpJsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
