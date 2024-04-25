import { it, expect, vi } from "vitest";
import { dynamo } from "../db/dynamoDBClient.js";
import { lambdaHandler, id } from "./createProduct.js";
import products from "../data/products.json";
import stocks from "../data/stocks.json";
import joinedData from "../data/joinedData.json";

vi.stubEnv('productsTable', 'products');
vi.stubEnv('stocksTable', 'stocks');

it("should create product without errors", async () => {
  const newId = "NEW_ID";
  const generateIdSpy = vi.spyOn(id, "generateId").mockImplementation(() => newId);

  const querySpy = vi
    .spyOn(dynamo, "query")
    .mockImplementation(obj => {
      const result = obj.TableName === 'products' ? products[0] : stocks[0];
      return { promise: () => Promise.resolve({Items: [result]}) };
    });

  const transactWriteSpy = vi
    .spyOn(dynamo, "transactWrite")
    .mockImplementation(() => {
      return { promise: () => Promise.resolve() };
    });

  const event = {
    body: {
      description: "New Product Description",
      price: 235,
      title: "New Product",      
      count: 2
    }
  };

  const response = await lambdaHandler(event);

  expect(generateIdSpy).toBeCalled();
  expect(transactWriteSpy).toBeCalledWith({
    TransactItems: [
      {
        Put: {
          Item: {
            id: "NEW_ID",
            description: "New Product Description",
            price: 235,
            title: "New Product"
          },          
          TableName: 'products',
        }
      }, 
      {
        Put: {
          Item: {
            productId: "NEW_ID",
            count: 2
          },          
          TableName: 'stocks',
        }
      }
    ]
  });
  expect(querySpy).toBeCalledTimes(2);
  expect(response).toEqual({
    statusCode: 201,
    body: JSON.stringify({ product: joinedData[0] }),
  });
});
