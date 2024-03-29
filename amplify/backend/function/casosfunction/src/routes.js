const AWS = require('aws-sdk');
const express = require('express');
const uuid = require('uuid');
var axios = require('axios');

let CASO_TABLE = "caso";
let PHOTO_TABLE= "foto";

if(process.env.ENV && process.env.ENV !== "NONE") {
  CASO_TABLE = CASO_TABLE + '-' + process.env.ENV;
  PHOTO_TABLE = PHOTO_TABLE + '-' + process.env.ENV;
}
AWS.config.update({ region: process.env.TABLE_REGION });

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = express.Router();

router.get('/casos', (req, res) => {
    const params = {
        TableName: CASO_TABLE
    };
    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'Error fetching the cases' });
        }
        res.json(result.Items);
    });
});


router.get('/casos/:id', (req, res) => {
    const photoCaseId = req.params.id;
    console.log("photoCaseId : " +photoCaseId );
    /*const params = {
        TableName: PHOTO_TABLE,
        FilterExpression: filtro
    };*/
    const params = {
        TableName: PHOTO_TABLE,
        FilterExpression: "photoCaseId = :photoCaseId_val",
        ExpressionAttributeValues: { ":photoCaseId_val": photoCaseId }
    };
    console.log(params);
    dynamoDb.scan(params, result);
    var count = 0;

    function result(err, data) {
        if (err) {console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));} 
        else {        
            console.log("Scan succeeded.");
            console.log("Data Items " + data.Items);
            /*data.Items.forEach(function(itemdata) {
                console.log("Item :", ++count,JSON.stringify(itemdata));
                res.json(data.Items);
            });*/
            res.status(200).json(data.Items);
            // continue scanning if we have more items
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                dynamoDb.scan(params, result);
            }
        }
    }
});

router.post('/casos', (req, res) => {
    const rightNow = new Date();
    const createdAt = rightNow.toISOString();
    const updatedAt = createdAt;
    const name = req.body.name;
    const caseStatus =  "Nuevo";
    const owner = req.body.owner;
    const id = uuid.v4();
    const params = {
        TableName: CASO_TABLE,
        Item: {
            id,
            createdAt,
            name,
            owner,
            caseStatus,
            updatedAt
        },
    };
    dynamoDb.put(params, (error, data) => {
        if (error) {
            res.statusCode = 500;
            res.json({error: error, url: req.url, body: req.body});
        }
        else{
            console.log("Case Created Successfully " + params.Item);
            res.status(201).send(params.Item);
        }   
    });
} );

router.post('/casos/:id', (req, res) => {
    const rightNow = new Date();
    const updatedAt = rightNow.toISOString();
    const caseStatus = req.body.caseStatus;
    const id = req.params.id;
    console.log(id);
    const params = {
        TableName: CASO_TABLE,
        Key:{
        "id": id
        },
        UpdateExpression: "set caseStatus = :caseStatus, updatedAt=:uA",
        ExpressionAttributeValues:{":caseStatus":caseStatus,":uA":updatedAt},
        ReturnValues:"UPDATED_NEW"
    };
    console.log(params);
    dynamoDb.update(params, (error, result) => {
    if (error) {
        res.status(400).json({ error: 'Could not update Case' });
      }
    res.status(200).json({result});
  });
});


router.delete('/casos/:id', (req, res) => {
    const id = req.params.id;
    const params = {
        TableName: CASO_TABLE,
        Key: {
            id
        }
    };
    dynamoDb.delete(params, (error) => {
        if (error) {
            res.status(400).json({ error: 'Could not delete Case' });
        }
        res.json({ success: true });
    });
});


module.exports = router;