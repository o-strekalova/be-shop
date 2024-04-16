import { it, expect } from "vitest";
import { lambdaHandler } from "./getProductsList.js";
import products from "../products.json";

it("should return all products without errors", async () => {
  const response = await lambdaHandler();
  expect(response).toEqual({
    statusCode: 200,
    body: JSON.stringify(products),
  });
});