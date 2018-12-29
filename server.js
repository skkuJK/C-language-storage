var net = require('net');
var fs = require("fs");
var fr = require('face-recognition');
var mysql = require('mysql');
var osu = require('node-os-utils');
var request = require('request');
var http = require('http');
var path = require('path');
var express = require('express');
var WebSocketServer = require('websocket').server;

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var webServer = http.createServer(app);
var webSocketClient;

// naver face api
var face_client_id = '4WJapEhMses36Y2YmBnR';
var face_client_secret = '68kLxV0viR';
var face_uri = 'https://openapi.naver.com/v1/vision/celebrity'; // 유명인 인식

var face_headers = {
        'X-Naver-Client-Id': face_client_id,
        'X-Naver-Client-Secret': face_client_secret
};
var tempNaverImage;
//

// naver news api
var news_client_id = 'MENuopwTfjYgP_Gt1IF4';
var news_client_secret = 'a7wsPDQGhp';
var news_headers = {
        'X-Naver-Client-Id': news_client_id,
        'X-Naver-Client-Secret': news_client_secret
};
//

var port =9990;
var detectNum = 0;

var currentSize = 0;
var totalSize = 0;

var tryCount = 0;
var commonPath = '/home/jang/faceServerTest/';
var commonPath2 = '/home/jang/faceServerTest/projectFiles/public/images/';
var commonPath3 = '/home/jang/faceServerTest/projectFiles/public/';
var detector = fr.FaceDetector();
var recognizer = fr.FaceRecognizer();
var recogStart;

var noRecCount = 0;

var td =0;
var tR =0;
var tl =0;
var tt =0;
var tNum =1;

//JSON Information
var tempResult = [];
var tempPredictions = [];
var faceLocation = [];
//
var noDetectCount = 0;


var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : 'root',
	database : 'face_recognition',
	ssl : false
});

function getCurrentDate() {
	var currentDate = new Date();
	var year = currentDate.getFullYear();
	var month = currentDate.getMonth() + 1;
	var date = currentDate.getDate();
	var hour = currentDate.getHours();
	var minute = currentDate.getMinutes();
	var second = currentDate.getSeconds();
	if (month < 10) {
		month = "0" + month;
	}
	if (date < 10) {
		date = "0" + date;
	}
	if (hour < 10) {
		hour = "0" + hour;
	}
	if (minute < 10) {
		minute = "0" + minute;
	}
	if (second < 10) {
		second = "0" + second;
	}
	return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}
function learningFace(dataTemp, dataCount, files){
        var dirFile = [];
	console.log("point : " + dataTemp[dataCount]);
        for(var i=0; i<files.length; i++){
                dirFile[i] = fr.loadImage(commonPath2 +'faceDetectStorage/test/' + dataTemp[dataCount] + '/' + files[i]);
		console.log(dataTemp[dataCount] + " ");
        }
	recognizer.addFaces(dirFile, dataTemp[dataCount]);
	var modelStateSerial = recognizer.serialize();
	var wStream = fs.createWriteStream(commonPath + 'projectFiles/' + 'model.json');
	wStream.write(JSON.stringify(modelStateSerial));
	wStream.end(function(err){
		console.log(dataTemp[dataCount] + " learning Done --------------------------------------------------");
		dataCount++;
        	if(dataCount < dataTemp.length){
                	readFileForLearning(dataTemp, dataCount);
        	}
		else{
			learningStart = false;
			noDetectCount = 0;
		}
	});

}
function searchDBForLearning(){
        var querys = 'SELECT korName From info';
        var dataCount = 0;
        var dataTemp = [];
        connection.query(querys, function(error, results, fields){
                if(error){
                        console.log('mysql error : ' + error);
                }
                else{
                        for(var i=0; i<results.length; i++){
                                dataTemp[i] = results[i].korName;
                        }
			console.log(dataTemp[dataCount]);
			readFileForLearning(dataTemp, dataCount);
                }
        });
}
function readFileForLearning(dataTemp, dataCount){
	fs.readdir(commonPath2 + 'faceDetectStorage/test/' + dataTemp[dataCount] + '/', function(err, files){
		if(!err){
			learningFace(dataTemp, dataCount, files);
		}
	}); 
}

function naverFace(loadImages, fileName){
	var temp;
	var naverImagePath = commonPath2 + 'faceStorageFromClient/' + fileName;
	var face_formData = {
  		image:'image',
  		image: fs.createReadStream(naverImagePath) // FILE 이름
	};

	request({
        method: 'POST',
        uri: face_uri,
        formData: face_formData,
        headers: face_headers
	}, function(error, response, body){
        	if(!error && response.statusCode === 200){
			temp = JSON.parse(body);
			if(temp.faces.length > 0 && temp.faces[0].celebrity.confidence > 0.45){
				console.log("naver result : " + JSON.stringify(temp));
				var naverKorName = temp.faces[0].celebrity.value;
				naverFaceDBCount(naverKorName, loadImages, fileName);
			}
		}
	});
}
function naverMakeFolder(naverKorName, loadImages, fileName){
	var afterNaverDir = commonPath2 + 'faceDetectStorage/test/' + naverKorName + '/';
	fs.mkdir(commonPath2 + 'faceDetectStorage/' + naverKorName, function(err) {
                if(err){
			console.log('Dont make folder in faceDetectStorage');
		} 
        });
        fs.mkdir(commonPath2 + 'faceDetectStorage/test/' + naverKorName, function(err){
        	if(err){
			console.log('Dont make folder in test');
		}
		else{		
			naverNews(naverKorName, afterNaverDir, loadImages, fileName);
		}
        });
}
function naverFaceLearning(naverKorName, afterNaverDir, loadImages, fileName){
	var faceImages = detector.detectFaces(loadImages);
        var fileNameSplit = fileName.split('.');
	
	for(var i=0; i<faceImages.length; i++){
		fr.saveImage(afterNaverDir + i + '_' + fileNameSplit[0] + '.png', faceImages[i]);
	}
		
	recognizer.addFaces(faceImages, naverKorName);

	var modelStateSerial = recognizer.serialize();
	var wStream = fs.createWriteStream(commonPath + 'projectFiles/' + 'model.json');
	wStream.write(JSON.stringify(modelStateSerial));
	wStream.end();
	noRecCount = 0;
	
	naverUpdateDB();
}
function naverFaceDBInsert(naverKorName, info1, info2, afterNaverDir, loadImages, fileName){
	var querys = 'INSERT INTO info (korName, beforeInfo, afterInfo) VALUES(?, ?, ?)';
	connection.query(querys, [naverKorName, info1, info2], function(error, results, fields){
		if(error){
			console.log('mysql error : ' + error);
                }
                else{
			naverFaceLearning(naverKorName, afterNaverDir, loadImages, fileName);
		}	
	});
}
function naverFaceDBCount(naverKorName, loadImages, fileName){
	var querys = 'SELECT korName From info';
	var dataTemp = [];
	connection.query(querys, function(error, results, fields){
		if(error){
			console.log('mysql error : ' + error);
		}
		else{
			for(var i=0; i<results.length; i++){
				dataTemp[i] = results[i].korName;		
			}
			if(!dataTemp.includes(naverKorName)){	
				naverMakeFolder(naverKorName, loadImages, fileName);
			}	
		}
	});
}
function naverNews(naverKorName, afterNaverDir, loadImages, fileName){
	var j=0;
	var news_uri = 'https://openapi.naver.com/v1/search/news?query=';
	news_uri = news_uri + encodeURI(naverKorName);
	news_uri = news_uri + "&display=100";
	console.log("url : " + news_uri);
	request({
        	method: 'GET',
        	uri: news_uri,
        	headers: news_headers
	}, function(error, response, body){
		var temp = JSON.parse(body);
		if(!error && response.statusCode === 200 && temp.items.length > 1){
			var info = [];
			for(var i=0; i<temp.items.length; i++){
				if(temp.items[i].title.indexOf(naverKorName) !== -1){
					info[j] = temp.items[i].title;
					info[j] = info[j].replace('<b>','');
					info[j] = info[j].replace('</b>','');
					info[j] = info[j].replace('&quot;',' ');
					info[j] = info[j].replace('&quot',' ');
					j++;
				}
				if(j===2){
					break;
				}
			}
			for(var k=0; k<2; k++){
				if(info[k]=== undefined){
					info[k] = naverKorName + "의 정보를 직접입력하세요.";
				}
			}
			naverFaceDBInsert(naverKorName, info[0], info[1], afterNaverDir, loadImages, fileName);
		}
	});
}
function noDetectSendJSON(client){	
	// --------------- JSON ---------------
	var object = new Object();
	object.currentDate = getCurrentDate();
	object.currentStat = "Detection Failure";
	var json = JSON.stringify(object);
	client.write(json + "\n", 'utf8');
	// --------------- JSON ---------------
}
function recognitionSendJSON(client){
	// --------------- JSON ---------------
        var object = new Object();
        object.currentDate = getCurrentDate();
        object.currentStat = "Recognition Success";
        object.predictions = tempPredictions;
        object.information = tempResult;
	object.faceLocation = faceLocation;
       	var json = JSON.stringify(object);
        client.write(json + "\n", 'utf8');
        // --------------- JSON ---------------
} 

function faceDetection(loadImages, fileName, client){
	var faceImages;
	var fileNameSplit;
	var tempName;
	var start = new Date();
	var j=0;

	faceLocation = [];

	var result = detector.locateFaces(loadImages).map(res => res.rect);
	var aa = JSON.stringify(result);
	
	if(result.length > 0){
		for(var i=0; i<result.length; i++){
			faceLocation[j] = (result[i].top)*(1440/360);
			faceLocation[j+1] = (result[i].bottom)*(1440/360);
			faceLocation[j+2] = (result[i].left)*(2768/480);
			faceLocation[j+3] = (result[i].right)*(2768/480);
			j = j+4; 
		}
	}
	
	faceImages = detector.getFacesFromLocations(loadImages, result);
	console.log('faceImages count : ' + faceImages.length);

	if(faceImages.length > 0){
		noDetectCount = 0;
		console.log('Face Detection completed');
		
		detectNum = 0;
		var faceImagesCount = 0;
		var end = new Date();
		td = td + (end.getTime() - start.getTime());
		if(tNum === 200){
			td = td/tNum;
		}
		console.log('TD : ' + td + ' ms  Total Number : ' + tNum); 
		console.log('Face Detection Opration Time : ' + end.getTime() + ' - ' + start.getTime() + ' = ' + (end.getTime() - start.getTime()) + ' msec');
		recogStart = new Date();
		faceRecognition(faceImages, loadImages, fileName, client);	
	}
	else{
		console.log('No Face Detection');
		noDetectCount++;
		if(noDetectCount === 30){
			searchDBForLearning(); 
		}
		var end = new Date();
		
		td = td + (end.getTime() - start.getTime());
		if(tNum === 200){
			td = td/tNum;
		}
		console.log('TD : ' + td + ' ms  Total Number : ' + tNum); 
		console.log('Face Detection Opration Time : ' + end.getTime() + ' - ' + start.getTime()  + ' = ' + (end.getTime() - start.getTime()) + ' msec');
		noDetectSendJSON(client);		
	}
}
function searchFaceDB(predictions, faceImages, loadImages, fileName, client, tempDir){
	var querys = 'SELECT * FROM info WHERE korName = ?';
	var noPredictions = {className : 'None', distance : 'None'};
	var noResult = {name : 'None', korName : '모름', beforeInfo : '모름', afterInfo : '모름'};
	console.log(predictions.className);
	connection.query(querys, [predictions.className], function(error, results, fields){
		if(error){
			console.log("DB error : " + error);
		}
		else{
			if(results[0] === undefined){
				tempResult[tryCount -1] = noResult;
				tempPredictions[tryCount -1] = predictions;	
			}
			else{
				tempResult[tryCount -1] = results[0];
				tempPredictions[tryCount -1] = predictions;
			}
			
			if(faceImages.length === 1){
				recogFaceSendImage(tempDir, predictions.className, tempResult[0].beforeInfo, tempResult[0].afterInfo);
			}
			if(faceImages.length === tryCount){
				var end = new Date();
				tR = tR + (end.getTime() - recogStart.getTime());
				if(tNum === 200){
					tR = tR/tNum;
				}
				console.log('TR : ' + tR + ' ms  Total Num : ' + tNum);
				console.log('Face Recognition Opration Time : ' + end.getTime() + ' - ' + recogStart.getTime() + ' = '  + (end.getTime() - recogStart.getTime()) + ' msec');
				recognitionSendJSON(client);
				clearInformationJSON();		
			}
			else{
				faceRecognition(faceImages, loadImages, fileName, client);
			}
		}
	});	
}
function clearInformationJSON(){
	tryCount = 0;
        tempPredictions = [];
        tempResult = [];
}
function faceRecognition(faceImages, loadImages, fileName, client){
	var noPredictions = {className : 'None', distance : 'None'};
	var noResult = {name : 'None', korName : '모름', beforeInfo : '모름', afterInfo : '모름'};
	var fileNameSplit;
	
	tryCount++;

	var predictions = recognizer.predictBest(faceImages[tryCount - 1]);
	
	if(faceImages.length > 0){
		if(predictions.distance <= 0.4){
			noRecCount = 0;
                	console.log("Recognition Success");
                	fileNameSplit = fileName.split('.');
			var tempDir = 'test/' + predictions.className + '/' + predictions.className + '_' + fileNameSplit[0] + '.png';
			fr.saveImage(commonPath2 + 'faceDetectStorage/test/' + predictions.className + '/' + predictions.className +  '_' + fileNameSplit[0] + '.png', faceImages[tryCount - 1]);
			searchFaceDB(predictions, faceImages, loadImages, fileName, client, tempDir);
			
		}
		else{
			console.log('This face is not existed');
			if(faceImages.length === 1 && noRecCount === 3){
				console.log("------------------------------naver search start-------------------------------------------------- ");
				naverFace(loadImages, fileName); 
				noRecCount = 0;
			}
			if(faceImages.length === 1){
				var fileNameSplit1 = fileName.split('.');		
				fr.saveImage(commonPath2 + 'faceDetectStorage/None/' + '_' + fileNameSplit1[0] + '.png', faceImages[0]);	
				noFaceSendImage('_' + fileNameSplit1[0] + '.png');
			}
			noRecCount++;
			tempResult[tryCount - 1] = noResult;
			tempPredictions[tryCount -1] = noPredictions;
			if(faceImages.length === tryCount){
				var end = new Date();
				tR = tR + (end.getTime() - recogStart.getTime());
				if(tNum === 200){
					tR = tR/tNum;
				}
				console.log('TR : ' + tR + ' ms  Total Num : ' + tNum);
				console.log('Face Recognition Opration Time : ' + end.getTime() + ' - ' + recogStart.getTime() + ' = ' + (end.getTime() - recogStart.getTime()) + 'msec');
                                recognitionSendJSON(client);
				clearInformationJSON();
			}
			else{
				faceRecognition(faceImages, loadImages, fileName, client);
			}
		}	
	}
}

var server = net.createServer(function(client) {
	console.log('Client connected');

	var writeStream;
	var fileName;
	var fileSize;
	var check;
	var isFileData = false;

	var start;
	var end;

	client.on('data', function(data) {
		if(isFileData){
			writeStream.write(data);
			check += data.length;
			if(check === fileSize){
				isFileData = false;
				writeStream.end(function(){
					console.log("다운로드 완료 : " + fileName);
					end = new Date();
					console.log('File Download Opration Time from client to server : ' + end.getTime() + ' - ' + start.getTime() + ' = ' + (end.getTime() - start.getTime()) + ' msec');
					var loadImages = fr.loadImage(commonPath2 + 'faceStorageFromClient/' + fileName);
					liveSendImage(fileName);
					faceDetection(loadImages, fileName, client);
				});
			}
			
		}else{
			isFileData = true;
			check = 0;
			data = JSON.parse(data);
			fileName = data.fileName;
			fileSize = data.fileSize;
			writeStream = fs.createWriteStream(commonPath2 + 'faceStorageFromClient/' + fileName);
			start = new Date();
			
			var object = new Object();
			object.fileName = fileName;
			object.fileSize = fileSize;
			var json = JSON.stringify(object);
			client.write(json + "\n", 'utf8');
			
			console.log("전체 크기 : " + fileSize);
		}
	});
	client.on('end', function() {
		console.log('Client disconnected');
	});
});

server.listen(port, function(){
	console.log('connection');
	var start = new Date();
	var modelState = require(commonPath + 'projectFiles/' + 'model.json');
	recognizer.load(modelState);
	var end = new Date();
	console.log('JSON upload time : ' + (end.getTime() - start.getTime()) + ' msec');
});

var webSocketServer = new WebSocketServer({
	httpServer: webServer,
	keepaliveInterval: 10000
});

webSocketServer.on('request', function(request){
	webSocketClient = request.accept('face-recognition', request.origin);
	webSocketClient.on('message', function(message) {
		var data = JSON.parse(message.utf8Data);
		var tempDir = JSON.stringify(data.fileDir);
		if(tempDir != undefined){
			var fileNameSplit = tempDir.split('/');
			if(data.currentState === "insertNoRecogFaceInfo"){
				webSearchDuplicateDB(data.name, data.beforeInfo, data.afterInfo, data.fileDir, fileNameSplit[3]);	
			}
			else if(data.currentState === "updateRecogFaceInfo"){
				webUpdateInfoDB(data.name, data.beforeInfo, data.afterInfo);
			}
		}
  	});
  	webSocketClient.on('error', function(error) {
    		console.log(error); //ignore
  	});
  	webSocketClient.on('close', function(close) {
		console.log(close);
  	});	
});

function liveSendImage(fileName){
	var object = new Object();
	object.currentState = "realTimeImage";
	object.fileDir = 'images/faceStorageFromClient/' + fileName;
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
}

function noFaceSendImage(fileName){
	var object = new Object();
	object.currentState = "noDetectFaceImage";
	object.fileDir = 'images/faceDetectStorage/None/' + fileName;
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
}

function recogFaceSendImage(fileName, name, info1, info2){
	var object = new Object();
	object.currentState = "recogFaceImage";
	object.currentName = name;
	object.beforeInfo = info1;
	object.afterInfo = info2;
	object.fileDir = 'images/faceDetectStorage/' + fileName;
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
}

function webSearchDuplicateDB(nameFromWeb, beforeInfo, afterInfo, fileDir, fileName){
        var querys = 'SELECT korName From info';
	var dataTemp = [];
        connection.query(querys, function(error, results, fields){
                if(error){
                        console.log('mysql error : ' + error);
                }
                else{
                        for(var i=0; i<results.length; i++){
                                dataTemp[i] = results[i].korName;
                        }
			if(!dataTemp.includes(nameFromWeb)){
				var loadImages = fr.loadImage(commonPath3 + fileDir);
				webMakeFolder(nameFromWeb, beforeInfo, afterInfo, fileName, loadImages);
			}
			else{
				faileWebInsertDB();	
			}	
                }
        });
}

function webMakeFolder(nameFromWeb, beforeInfo, afterInfo, fileName, loadImages) {
	var afterWebDir = commonPath2 + 'faceDetectStorage/test/' + nameFromWeb + '/';
	fs.mkdir(commonPath2 + 'faceDetectStorage/' + nameFromWeb, function(err) {
		if (err) {
			console.log('Dont make folder in faceDetectStorage');
		}
	});
	fs.mkdir(commonPath2 + 'faceDetectStorage/test/' + nameFromWeb, function(err) {
		if (err) {
			console.log('Dont make folder in test');
		}
		else {
			webInsertInfoDB(nameFromWeb, beforeInfo, afterInfo, afterWebDir, fileName, loadImages);
		}	
	});
}

function webInsertInfoDB(nameFromWeb, beforeInfo, afterInfo, afterWebDir, fileName, loadImages){
	var querys = 'INSERT INTO info (korName, beforeInfo, afterInfo) VALUES(?, ?, ?)';
	connection.query(querys, [nameFromWeb, beforeInfo, afterInfo], function(error, results, fields){
		if(error){
			console.log('mysql error : ' + error);
                }
                else{
			successWebInsertDB();
			webFaceLearning(nameFromWeb, afterWebDir, loadImages, fileName);
		}	
	});
}

function successWebInsertDB(){
	var object = new Object();
	object.currentState = "successWebInsertDB";
	object.fileDir = 'images/default.png';
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
} 

function faileWebInsertDB(){
	var object = new Object();
	object.currentState = "failWebInsertDB";
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
}

function failWebDB(){
	var object = new Object();
	object.currentState = "faileWebDB";
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
}

function webFaceLearning(nameFromWeb, afterWebDir, loadImages, fileName){
	var faceImages = detector.detectFaces(loadImages);
	var fileNameSplit = fileName.split('.');

	for(var i=0; i<faceImages.length; i++){
		fr.saveImage(afterWebDir + i + '_' + fileNameSplit[0] + '.png', faceImages[i]);
	}
	recognizer.addFaces(faceImages, nameFromWeb);

	var modelStateSerial = recognizer.serialize();
	var wStream = fs.createWriteStream(commonPath + 'projectFiles/model.json');
	wStream.write(JSON.stringify(modelStateSerial));
	wStream.end();
}

function webUpdateInfoDB(nameFromWeb, beforeInfo, afterInfo){
	var querys = 'UPDATE info set korName = ?, beforeInfo = ?, afterInfo = ? WHERE korName = ?';
        connection.query(querys, [nameFromWeb, beforeInfo, afterInfo, nameFromWeb], function(error, results, fields){
                if(error){
                        console.log('mysql error : ' + error);
			failWebUpdateDB();	
                }
                else{
			successWebUpdateDB();
                }
        });
}

function successWebUpdateDB(){
	var object = new Object();
	object.currentState = "successWebUpdateDB";
	object.fileDir = 'images/default.png';
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
} 

function failWebUpdateDB(){
	var object = new Object();
	object.currentState = "failWebUpdateDB";
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
}

function naverUpdateDB(){
	var object = new Object();
	object.currentState = "successNaverUpdateDB";
	object.fileDir = 'images/default.png';
	var json = JSON.stringify(object);
	webSocketClient.sendUTF(json);
}

webServer.listen(9991, function(){
	console.log("웹 서버 시작");
});
