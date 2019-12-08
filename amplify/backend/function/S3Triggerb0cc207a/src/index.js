// amplify/backend/function/S3Triggerxxxxxxx/src/index.js

const AWS = require('aws-sdk');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const Rekognition = new AWS.Rekognition();
const DynamoDBDocClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const uuidv4 = require('uuid/v4');

/*
Note: Sharp requires native extensions to be installed in a way that is compatible
with Amazon Linux (in order to run successfully in a Lambda execution environment).

If you're not working in Cloud9, you can follow the instructions on http://sharp.pixelplumbing.com/en/stable/install/#aws-lambda how to install the module and native dependencies.
*/
const Sharp = require('sharp');

// We'll expect these environment variables to be defined when the Lambda function is deployed
const THUMBNAIL_WIDTH = parseInt(process.env.THUMBNAIL_WIDTH, 10);
const THUMBNAIL_HEIGHT = parseInt(process.env.THUMBNAIL_HEIGHT, 10);
const DYNAMODB_PHOTOS_TABLE_NAME = process.env.DYNAMODB_PHOTOS_TABLE_ARN.split('/')[1];

async function getLabelNames(bucketName, key) {
  let params = {
    Image: {
      S3Object: {
        Bucket: bucketName, 
        Name: key
      }
    }, 
    MaxLabels: 10, 
    MinConfidence: 70
  };
  //console.log("Parametros: " + JSON.stringify(params));
  const detectionResult = await Rekognition.detectLabels(params).promise();
  //console.log ("Detection results: "+ detectionResult.Labels );
  
  const labelNames = detectionResult.Labels.map((l) => l.Name.toLowerCase()); 
  return labelNames;
}

async function getModerationLabels(bucketName, key) {
  let params = {
    Image: {
      S3Object: {
        Bucket: bucketName, 
        Name: key
      }
    }, 
    MinConfidence: 50
  };
  console.log("Parametros: " + JSON.stringify(params));
  const detectModerationLabels = await Rekognition.detectModerationLabels(params).promise();
	//console.log ("Detection Moderation results: "+ JSON.stringify(detectModerationLabels.ModerationLabels));
  
  if (detectModerationLabels.ModerationLabels.length  === 0  ) {
  	//console.log("arreglo vacio");
  	return null;
  }
	 else{
		const moderationLabels = detectModerationLabels.ModerationLabels.map((l) => l.Name.toLowerCase()); 
  	//console.log("Si traigo etiquetas de moderacion");
  	return moderationLabels;
	 }	 
}


function storePhotoInfo(item) {
	const params = {
		Item: item,
		TableName: DYNAMODB_PHOTOS_TABLE_NAME
	};
	return DynamoDBDocClient.put(params).promise();
}

async function getMetadata(bucketName, key) {
	const headResult = await S3.headObject({Bucket: bucketName, Key: key }).promise();
	return headResult.Metadata;
}

function thumbnailKey(filename) {
	return `public/resized/${filename}`;
}

function fullsizeKey(filename) {
	return `public/${filename}`;
}

function makeThumbnail(photo) {
	return Sharp(photo).resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT).toBuffer();
}

async function resize(bucketName, key) {
	const originalPhoto = (await S3.getObject({ Bucket: bucketName, Key: key }).promise()).Body;
	const originalPhotoName = key.replace('uploads/', '');
	const originalPhotoDimensions = await Sharp(originalPhoto).metadata();

	const thumbnail = await makeThumbnail(originalPhoto);

	await Promise.all([
		S3.putObject({
			Body: thumbnail,
			Bucket: bucketName,
			Key: thumbnailKey(originalPhotoName),
		}).promise(),

		S3.copyObject({
			Bucket: bucketName,
			CopySource: bucketName + '/' + key,
			Key: fullsizeKey(originalPhotoName),
		}).promise(),
	]);

	await S3.deleteObject({
		Bucket: bucketName,
		Key: key
	}).promise();

	return {
		photoId: originalPhotoName,
		
		thumbnail: {
			key: thumbnailKey(originalPhotoName),
			width: THUMBNAIL_WIDTH,
			height: THUMBNAIL_HEIGHT
		},

		fullsize: {
			key: fullsizeKey(originalPhotoName),
			width: originalPhotoDimensions.width,
			height: originalPhotoDimensions.height
		}
	};
};

async function processRecord(record) {
	const bucketName = record.s3.bucket.name;
	const key = record.s3.object.key;
	if (key.indexOf('uploads') != 0) return;
	const rightNow = new Date();
  const createdAt = rightNow.toISOString();
  const moderationLabels = await getModerationLabels(bucketName, key);
  if (typeof moderationLabels != 'undefined' && moderationLabels){
  	console.log("Se detectaron las siguientes etiquetas de Moderacion: "  + moderationLabels);
		console.log("Prohibido subir imagenes de desnudo explícito, insinuante, violentas o visualmente perturbadoras");
	
		await S3.deleteObject({
		Bucket: bucketName,
		Key: key
	}).promise();
		return;
		
	}
	const metadata = await getMetadata(bucketName, key);
	const sizes = await resize(bucketName, key);    
	const labelNames = await getLabelNames(bucketName, sizes.fullsize.key);
	//console.log("Etiquetas: "  + labelNames);
	
	const id = uuidv4();
	const item = {
		id: id,
		owner: metadata.owner,
		labels: labelNames,
		photoCaseId: metadata.caseid,
		bucket: bucketName,
		thumbnail: sizes.thumbnail,
		fullsize: sizes.fullsize,
		createdAt: createdAt
	}
	await storePhotoInfo(item);
}

exports.handler = async (event, context, callback) => {
	try {
		event.Records.forEach(processRecord);
		callback(null, { status: 'Photo Processed' });
	}
	catch (err) {
		console.error(err);
		callback(err);
	}
};