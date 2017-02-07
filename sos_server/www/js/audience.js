
var socket = io('http://'+window.location.host);

var Chat = {},token,map, cur = null;
Chat.socket = null;
var sourceBuffer = null, ms;
var flightPlanCoordinates = [];
var flightPath;

function init(){

  flightPath = new google.maps.Polyline({
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);


    map = document.getElementById('map');
    // console.log(map);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: {lat: 40.8075355, lng: -73.9625727},
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
     var subscription ={};
     loc_str = window.location.toString();
    if (loc_str[loc_str.length-1]=="/"){
        loc_str = loc_str.substring(0,loc_str.length-1);
     }
     last = loc_str.lastIndexOf("/");
     token = loc_str.substring(last+1);
     subscription.join = token;




     socket.emit('join', subscription);
     socket.on('history', function (data) {
        console.log(data);
        console.log(data["history"]);
        plotHistory(data["history"]);
        loadInfo(data["CriminalInformation"]);
    });
	 socket.on('help', function (data) {
        
        plotPoints(data);
    });

	

}




function loadInfo(data){
	var img = document.getElementById('cimg');
		img.src= data["Picture"];
		console.log(img);
}

function plotHistory(data){
	//console.log(data);
	
	for (var i = 0; i < data.length; i++){
		var latlng = data[i];
		latlng = new google.maps.LatLng(parseFloat(latlng[0]),parseFloat(latlng[1]));
		var path = flightPath.getPath();
		path.push(latlng);
		if (i == data.length - 1){
			if(cur==null){
				cur = new google.maps.Marker({
				map: map,
				position:  latlng
				});
			}else{
				cur.setPosition(latlng);
			}
		}
	}
	    
	flightPath.setMap(map);
	
}
  
function plotPoints(data){
    
    latlng  = new google.maps.LatLng(parseFloat(data["lat"]),parseFloat(data["lng"]));
    if(cur==null){
        cur = new google.maps.Marker({
        map: map,
        position:  latlng
    });
    }else{
		cur.setPosition(latlng);
	}
 
    map.setZoom(17); 
    map.panTo(latlng);
    var path = flightPath.getPath();
    console.log(path);
  // Because path is an MVCArray, we can simply append a new coordinate
  // and it will automatically appear.
    path.push(latlng);
    flightPath.setMap(map);

    console.log(latlng);
}  



