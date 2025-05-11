const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1', // Change if needed
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = 'Users';

async function createUser({ username, email, passwordHash }) {
  const userId = uuidv4();
  const createdAt = Date.now();
  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      username,
      email,
      passwordHash,
      createdAt,
    },
    ConditionExpression: 'attribute_not_exists(email) AND attribute_not_exists(username)',
  };
  await dynamoDB.put(params).promise();
  return { userId, username, email, createdAt };
}

async function getUserByEmail(email) {
  const params = {
    TableName: USERS_TABLE,
    IndexName: 'email-index', // You need to create a GSI on email for this to work
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: { ':email': email },
  };
  const result = await dynamoDB.query(params).promise();
  return result.Items && result.Items[0];
}

module.exports = { createUser, getUserByEmail };
