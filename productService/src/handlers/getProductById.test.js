import { it, expect, vi, beforeEach } from "vitest";
import { lambdaHandler, generateProductNotFoundError } from "./getProductById.js";
import products from "../data/products.json";
import stocks from "../data/stocks.json";
import joinedData from "../data/joinedData.json";
import { dynamo } from "../db/dynamoDBClient.js";

vi.stubEnv('productsTable', 'products');
vi.stubEnv('stocksTable', 'stocks');
let querySpy;

beforeEach(() => {
  querySpy = vi
    .spyOn(dynamo, "query")
    .mockImplementation(obj => {
      const items = [];
      const id = obj.ExpressionAttributeValues[':id'];
      let result;
      if (obj.TableName === 'products') {
        result = products.find(product => product.id === id);
      } else {
        result = stocks.find(stock => stock.productId === id);
      }
      if (result) items.push(result);

      return { promise: () => Promise.resolve({Items: items}) };
  });
});

it("should return the product for valid product id", async () => {
  const event = {
    pathParameters: {
      productId: products[1].id,
    },
  };

  const response = await lambdaHandler(event);

  expect(querySpy).toBeCalledTimes(2);
  expect(response).toEqual({
    statusCode: 200,
    body: JSON.stringify({ product: joinedData[1] }),
  });
});

it("should throw not found error if product with specified productId doesn't exist", async () => {
  const productId = "NOT_EXISTING_ID";
  const event = {
    pathParameters: {
      productId,
    },
  };

  await expect(lambdaHandler(event)).rejects.toThrow(
    generateProductNotFoundError(productId)
  );
  expect(querySpy).toBeCalledTimes(1);
});