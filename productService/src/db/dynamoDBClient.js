import AWS from "aws-sdk";

export const dynamo = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});