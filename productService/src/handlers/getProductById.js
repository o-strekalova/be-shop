import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import httpEventNormalizer from "@middy/http-event-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";

export const generateProductNotFoundError = (productId) =>
  new createError.NotFound(`Product with id '${productId}' is not found`);

export const lambdaHandler = async (event) => {
  const { productId } = event.pathParameters;
  const { default: products } = await import("../products.json");
  const existingProduct = products.find((product) => product.id === productId);

  if (!existingProduct) {
    throw generateProductNotFoundError(productId);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      product: existingProduct,
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
