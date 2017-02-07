'use strict';

// setup default env variables
const path = require('path');
const express = require('express');
const app = express();
const expressWs = require('express-ws');
const fs = require('fs')
const default_port = 7575;
const http_port = 9000;
const https = require('https')
const http = require('http')
const twilio = require('twilio');
var url = require('url');
var historyLog = {};
var env = require('dotenv').load();
var accountSid = process.env.accountSid;
var authToken = process.env.authToken;
var NodeGeocoder=require('node-geocoder');
var client = require('twilio')(accountSid, authToken);
var toNumber = process.env.toNumber;
var fromNumber = process.env.fromNumber;
var info = {}; 
var request = require('request');
var options={
   provider:'google',
   httpAdapter:'https',
   apiKey:process.env.reverseGeo,
   formatter:null
};
var geocoder=NodeGeocoder(options);
var criminalInfoDb = {};

const credentials = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
}

 
app.set('views', path.join(__dirname, 'views'));  
app.set('view engine', 'ejs');

app.use(express.static('../www/'));



// var port = Number(process.env.PORT || default_port);


const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

var io = require('socket.io')(httpServer);

io.on('connection', function (socket) {
  
  socket.on('join', function (data) {
   
    socket.join(data["join"]);
    //console.log(historyLog[data["join"]]);
    var para = {};
    para["history"] = historyLog[data["join"]];
    para["CriminalInformation"] = criminalInfoDb[data["join"]];
    socket.emit('history', para);

  });
 

  socket.on('init', function (data) {

    socket.join(data["fbId"]);
    console.log(data);
    historyLog[data["fbId"]] = [[data["lat"],data["lng"]]];
    var helpInfo = {};
    helpInfo['lat']=data["lat"];
    helpInfo['lng']=data["lng"];
    socket.broadcast.to(data["fbId"]).emit('help', helpInfo);
    //console.log(socket)
    geocoder.reverse({lat:data["lat"],lon:data["lng"]},function(err,res)
    {
            info[data["fbId"]]={Name:data["fbName"],Address:res[0]["formattedAddress"]};
            require("./twilio_sos")(socket.handshake,data["fbId"],info);
           
    });


    require("./lyft_sos")(data["lat"],data["lng"]);

    socket.emit('liveUrl', data["fbId"]);

  });

  socket.on('live_update', function (data) {
    var helpInfo = {};
    helpInfo['lat']=data["lat"];
    helpInfo['lng']=data["lng"];
    socket.broadcast.to(data["fbId"]).emit('help', helpInfo);
    historyLog[data["fbId"]].push([data["lat"],data["lng"]]);
  });

  socket.on('criminal_img', function (data) {
    img_congitive(data["fbId"],data["url"]);
    
  });

});

function img_congitive(fbid,url){

          var cvBody = {
            "url":url
          };
          var cvBodyData = JSON.stringify(cvBody);
          console.log(cvBodyData);
          request({
            headers: {
              "Content-Type":"application/json",
              "Ocp-Apim-Subscription-Key":process.env.computerVision
            },
            url: "https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=description,faces",
            body: cvBodyData,
            method: 'POST'
            }, function (err, res, body) {
              //jsonString += body ;
           
              var jsonData = JSON.parse(body);
              //console.log(jsonData);
              if(jsonData["description"]){
                //console.log(JSON.parse(jsonString));
                var criminalInfo = {};
                criminalInfo['Picture']=url;
                if(jsonData['description']['captions'][0]){
                  criminalInfo['Description']=jsonData['description']['captions'][0]['text'];
                }
                if(jsonData['faces'][0]){
                criminalInfo['Age']=jsonData['faces'][0]['age'];
                criminalInfo['Gender']=jsonData['faces'][0]['gender'];
                }
                criminalInfoDb[fbid] = criminalInfo;
                console.log(criminalInfo);
              }
              
            });


}






httpServer.listen(http_port);
console.log('Listening http on port:' + http_port);

// app.listen(port, function () {
//     console.log('Listening on port:' + port);
   
// });

//tell express what to do when the /about route is requested
app.get('/w/*', function(req, res){
	var pathname = url.parse(req.url).pathname;
    //console.log("Request file_path " + pathname[2]+ " received.");
    var params = {name:pathname}
    res.render('playback', params);
    
});



app.post('/h/*', function (req, res){
  // Use the Twilio Node.js SDK to build an XML response
  var pathname = url.parse(req.url).pathname.substring(3);
  let twiml = new twilio.TwimlResponse();
  twiml.say("I am "+info[pathname]["Name"]+". I am threatened. My current location is "+info[pathname]["Address"]+". Please help. Watch my live location at http://"+req.headers.host+"/w/"+pathname, { voice: 'alice' });

  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});




app.get('/lyft', function(req, response){
    //console.log("Request file_path " + pathname[2]+ " received.");
    
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var request = require('request');
    console.log(query['code']);
    var getcodeBody = {
						"grant_type":"authorization_code",
						"code": query['code']
	  };
	 var getcodeBodyData = JSON.stringify(getcodeBody);
	 var user = process.env.client_id;
     var pass = process.env.client_secret;

     var auth = new Buffer(user + ':' + pass).toString('base64');
	 request({
			    headers: {
							"Content-Type":"application/json",
							'Authorization': 'Basic ' + auth
						},
			    url: "https://api.lyft.com/oauth/token",
				body: getcodeBodyData,
				method: 'POST'
				}, function (err, res, body) {
						console.log(err);
						var token=JSON.parse(body);
						console.log(token['access_token']);
                       
						response.status(200).send(token['access_token']);
					});
    
});

