 
var env = require('dotenv').load();
var client = require('twilio')(process.env.accountSid, process.env.authToken);

module.exports = function (req,fbid,info) {
 			
 			client.messages.create({
                to: process.env.toNumber,
                from: process.env.fromNumber,
                body: "I am "+info[fbid]["Name"]+". I am threatened. My current location is "+info[fbid]["Address"]+". Please help. Watch my live location at http://"+req.headers.host+"/w/"+fbid,
            }, function (err, message) {
                //console.log(message.sid);
			});
			client.calls.create({                                  //make outbound call
						url: "http://"+req.headers.host+"/h/"+fbid,
						//url: "http://demo.twilio.com/docs/voice.xml",
						//url: "http://54.221.40.5:9000/h/123",
						to: process.env.toNumber,
						from: process.env.fromNumber
			}, function(err, call) {
						console.log(err);
							//process.stdout.write(call.sid);
			});

}