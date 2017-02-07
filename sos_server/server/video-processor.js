'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var uuid = require('uuid-random');
var url = require('url');
require('date-utils');
var videoFileExtension = '.webm';
var host = [];
var room = {};
var historyLog = {};
var prevFilePath = '';
var env = require('dotenv').load();
console.log(process.env.accountSid);
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
var jsonString = '';
var jsonData = '';
var criminalInfoDb = {};







function broadcast(ws,hashid,key,data){
    var para = {};
    para[key] = data;
    // console.log(room[hashid]);
	console.log(para);
    for(var i in room[hashid]){
        if(room[hashid][i]!= ws){
            console.log("client"+room[hashid][i]);
            try {
                room[hashid][i].send(JSON.stringify(para));
            }catch(e){
                room[hashid][i].close();
                delete room[hashid][i];
            }
        }
    }
}




function GetNearPolice(lat,lng){

var radius = 500000;
var location = lat+","+lng;

var sensor = false;
var types = "police";

var https = require('https');
var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + process.env.reverseGeo + "&location=" + location + "&radius=" + radius + "&sensor=" + sensor + "&types=" + types+"&limit=1";
//console.log(url);
https.get(url, function(response) {
var body ='';
    response.on('data', function(chunk) {
        body += chunk;
    });

    response.on('end', function() {
      var places = JSON.parse(body);
      var locations = places.results;
      //console.log(locations);
      var des=locations[0]["geometry"]["location"];
      //console.log(locations);
      //console.log(des);
      //console.log(locations[0]);
      request_lyft(lat,lng,des['lat'],des['lng'])
      var randLoc = locations[Math.floor(Math.random() * locations.length)];
      //console.log(places);
      
      
      
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});                   
                    

}
function request_lyft(from_lat,from_lng, to_lat,to_lng){
     var lyftBody = {
						"ride_type":"lyft",
						"origin": {"lat":from_lat,"lng":from_lng},
						"destination":{"lat":to_lat,"lng":to_lng}
	  };
	 var lyftBodyData = JSON.stringify(lyftBody);
	 console.log(lyftBodyData);
	 request({
			    headers: {
					        "Authorization":'Bearer '+ process.env.lyft,
							"Content-Type":"application/json"
						},
			    url: "https://api.lyft.com/v1/rides",
				body: lyftBodyData,
				method: 'POST'
				}, function (err, res, body) {
						console.log(err);
						var cancel_ride=JSON.parse(body)
						setTimeout(cancel_lyft_request, 4000, cancel_ride["ride_id"]);
					});

}
function cancel_lyft_request(ride_id){
        request({
			    headers: {
					        "Authorization":'Bearer '+ process.env.lyft,
							"Content-Type":"application/json"
						},
			    url: "https://api.lyft.com/v1/rides/"+ride_id+"/cancel",
				method: 'POST'
				}, function (err, res, body) {
						console.log("canceled ride")
					});

 

}

function close_subscriptions(ws,hashid){

    for(var i in room[hashid]){
        if(room[hashid][i]!= ws){
            console.log("client"+room[hashid][i]);
            try {
                room[hashid][i].close();
            }catch(e){
                room[hashid][i].close();
            }
        }
    }
}
module.exports = function (app) {
    // console.log(app.ws)
    app.ws('/', function (ws, req) {
      
        //var hashid = uuid();
        //ws.name = hashid;
		var fbid = null;
        console.log('new connection established');
		
        ws.on('message', function(data) {
          
               data = JSON.parse(data);
			   //console.log(data);
               //console.log(room[data["fbid"]]);
			   
			   //var fbid = data["fbid"];
               if(data["join"] && room[data["join"]]){
                    room[data["join"]].push(ws);
					var para = {};
					para["history"] = historyLog[data["join"]];
					para["CriminalInformation"] = criminalInfoDb[data["join"]];
					console.log(historyLog[data["join"]]);
					ws.send(JSON.stringify(para));
					console.log(criminalInfoDb[data["join"]]);
					//broadcast(ws,data["join"],"CriminalInformation",criminalInfoDb[data["join"]]);
               }else if(data["action"]=="sos_live_loc" && data["fbid"]){   //client pass json, id location
                    fbid = parseInt(data["fbid"],10); 
					room[fbid] = [ws];
                    //room[fbid].push(ws);
					var helpInfo = {};
					helpInfo['lat']=data["lat"];
					helpInfo['lng']=data["lng"];
					broadcast(ws,fbid,"help",data["helpInfo"]);
					historyLog[fbid]=[[data["lat"],data["lng"]]];
					console.log(historyLog);
					GetNearPolice(data['lat'],data['lng']);
					
					var cvBody = {
						"url":data["url"]
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
							jsonData = JSON.parse(body);
							console.log(jsonData);
							//console.log(JSON.parse(jsonString));
							var criminalInfo = {};
							criminalInfo['Picture']=data["url"];
							if(jsonData['description']['captions'][0]){
								criminalInfo['Description']=jsonData['description']['captions'][0]['text'];
							}
							if(jsonData['faces'][0]){
							criminalInfo['Age']=jsonData['faces'][0]['age'];
							criminalInfo['Gender']=jsonData['faces'][0]['gender'];
							}
							criminalInfoDb[fbid] = criminalInfo;
							console.log(criminalInfo);
							
							
						});
					//console.log(jsonData);
				
                    geocoder.reverse({lat:data["lat"],lon:data["lng"]},function(err,res)
                    {
						info[fbid]={Name:"abc",Address:res[0]["formattedAddress"]};
						client.messages.create({
							to: toNumber,
							from: fromNumber,
							body: "I am "+info[fbid]["Name"]+". I am threatened. My current location is "+info[fbid]["Address"]+". Please help. Watch my live location at http://"+req.headers.host+"/w/"+fbid,
					}, function (err, message) {
							//console.log(message.sid);
						});
                    });

                   
                    //geocoder.reverse({lat:data["lat"],lon:data["lng"]},reverseGeo);
                    //GetNearPolice(data["lat"],data["lng"]);

					ws.send(data["fbid"].toString());
					console.log("http://"+req.headers.host+"/h/"+fbid);
					client.calls.create({                                  //make outbound call
						url: "http://"+req.headers.host+"/h/"+fbid,
						//url: "http://demo.twilio.com/docs/voice.xml",
						//url: "http://54.221.40.5:9000/h/123",
						to: toNumber,
						from: fromNumber
					}, function(err, call) {
						console.log(err);
							//process.stdout.write(call.sid);
					});
					
				
					

               }else if(data["action"]=="sos_live_loc" && ! data["fbid"]){
					var helpInfo = {};
					helpInfo['lat']=data["lat"];
					helpInfo['lng']=data["lng"];
					broadcast(ws,fbid,"help",helpInfo);
                    //broadcast(ws,fbid,"help",data["lat"]+","+data["lng"]);
                    //console.log(data["lat"]); 
                    //console.log(data["lng"]); 
					historyLog[fbid].push([data["lat"],data["lng"]]);
					//console.log(historyLog);

               }else if(data["join"] && !room[data["join"]]){
                    // var para = {};
                    // para["end"]=1;
                    // ws.send(JSON.stringify(para));
                    ws.close();
               
               }
			   
             //console.log(historyLog);
        });
        ws.on('close', function(data) {
            //reload clients' <video> to full video 
            //delete real dir 
            var checkhost = host.indexOf(ws); 
            if(checkhost!= -1){
                var delid = host[checkhost].name;
                // console.log(host[checkhost].name);
                // broadcast(ws,delid,"end",1);
                // deleteRealDir(delid);
                delete host[checkhost]; 
                close_subscriptions(ws,delid);
                delete room[delid];
            }
       
        });
        //ws.send(hashid);
    });
	
	return info;
 
};