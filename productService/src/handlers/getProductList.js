import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import httpCors from "@middy/http-cors";
import { CORS_ORIGINS_WHITE_LIST } from "../cors.js";
import { dynamo } from "../db/dynamoDBClient.js";

const scan = async (tableName) => {
  const scanResults = await dynamo.scan({
    TableName: tableName
  }).promise();

  return scanResults.Items;
}

export const lambdaHandler = async (event) => {
  console.log(`getProductList event - ${event}`);

  let products = await scan(process.env.productsTable);  
  let stocks = await scan(process.env.stocksTable);

  products = products.map(product => {
    return {
      ...product,
      count: stocks.find(item => item.productId === product.id).count,
    }
  })

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
