
var env = require('dotenv').load();
var request = require('request');

module.exports = function (lat,lng) {

	GetNearPolice(lat,lng);

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
      console.log(locations);
      //if(locations[0]){

		  var des=locations[0]["geometry"]["location"];
		 
		  request_lyft(lat,lng,des['lat'],des['lng'])
      //}
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
						setTimeout(cancel_lyft_request, 5000, cancel_ride["ride_id"]);
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
