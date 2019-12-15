const AWS = require('aws-sdk');
const express = require('express');
const uuid = require('uuid');

let CASO_TABLE = "caso";

if(process.env.ENV && process.env.ENV !== "NONE") {
  CASO_TABLE = CASO_TABLE + '-' + process.env.ENV;
}
AWS.config.update({ region: process.env.TABLE_REGION });

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = express.Router();

router.get('/fotos', (req, res) => {
    const caseStatus =  "En Progreso";
    const params = {
        TableName: CASO_TABLE,
        FilterExpression: 'caseStatus = :caseStatus',
        ExpressionAttributeValues: {":caseStatus":caseStatus}
    };
    console.log(params);
    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'Error fetching the cases' });
        }
        res.json(result.Items);
    });
});

module.exports = router;