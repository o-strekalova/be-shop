import { it, expect, vi } from "vitest";
import { lambdaHandler } from "./getProductList.js";
import products from "../data/products.json";
import stocks from "../data/stocks.json";
import joinedData from "../data/joinedData.json";
import { dynamo } from "../db/dynamoDBClient.js";

it("should return all products without errors", async () => {
  vi.stubEnv('productsTable', 'products');
  vi.stubEnv('stocksTable', 'stocks');

  const scanSpy = vi
    .spyOn(dynamo, "scan")
    .mockImplementation(obj => {
      let results = obj.TableName === 'products' ? products : stocks;
      return { promise: () => Promise.resolve({Items: results}) };
  });

  const response = await lambdaHandler();

  expect(scanSpy).toBeCalledTimes(2);
  expect(response).toEqual({
    statusCode: 200,
    body: JSON.stringify(joinedData),
  });
});