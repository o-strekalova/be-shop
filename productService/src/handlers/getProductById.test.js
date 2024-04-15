import { it, expect } from "vitest";
import {  lambdaHandler,  generateProductNotFoundError} from "./getProductById.js";
import products from "../products.json";

it("should return the product for valid product id", async () => {
  const product = products[0];
  const event = {
    pathParameters: {
      productId: product.id,
    },
  };

  const response = await lambdaHandler(event);
  expect(response).toEqual({
    statusCode: 200,
    body: JSON.stringify({ product }),
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
});