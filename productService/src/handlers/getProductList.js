import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";

export const lambdaHandler = async () => {
  const { default: products } = await import("../products.json");

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};

export default middy()
  .use(errorLogger())
  .use(
    httpCors({
      origins: CORS_ORIGINS_WHITE_LIST,
    })
  )
  .handler(lambdaHandler);
