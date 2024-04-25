import { dynamo } from "./dynamoDBClient.js";
import products from "../data/products.json";
import stocks from "../data/stocks.json";

const seedData = async (items, tableName) => {
    const requests = items.map(item => {
        return { PutRequest: { Item: item } };
    });

    try {
        await dynamo
            .batchWrite({ RequestItems: { [tableName]: requests } })
            .promise();

        console.log(`Table - ${tableName} was updated successfully`);
    } catch (err) {
        console.error(err);
    }
};

seedData(products, "products");
seedData(stocks, "stocks");