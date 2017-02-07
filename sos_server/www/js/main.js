var map,geo_marker;
var socket = io('http://'+window.location.host);
function init() {
    var recorder;
    var mediaStream;
    var fileName;
    var connection;
    var fileLocation;
    var AbleToRecord = true;
    var port = 9000;

    
    socket.on('liveUrl', function (data) {
            fileName = data;
            fileLocation = 'http://' + window.location.host + '/w/'+ fileName;

            var recButton = document.getElementById('record');
            recButton.innerHTML = "Cancel";
            $("#record").removeClass("btn-primary").addClass("btn-danger");

            $('#share').show();
            $('#share').html('<p> Now live on: </p><a onclick="window.open(\''+fileLocation+"/"+'\');"style="color:#d6d6f5;">'+fileLocation+'</a>');
            AbleToRecord = true;
            var obj = new Object();
            obj.url = document.getElementsByName('criminal_img')[0].value;
            obj.fbId=123;
            socket.emit('criminal_img', obj);
    });

    var recButton = document.getElementById('record');
    recButton.addEventListener('click', function (e) {
        if(AbleToRecord){
            if(recButton.innerHTML == "Shoot"){
                //getWebSocket();
                 var obj = new Object();
               //console.log(document.getElementsByName('criminal_img')[0].value);
               //obj.url = document.getElementsByName('criminal_img')[0].value;
               //obj.action = "sos_live_loc";
               obj.fbId=123;
               obj.fbName = "Alice Lin";
               if (geo_marker!=null){
                 obj.lat = geo_marker.getPosition().lat();
                 obj.lng = geo_marker.getPosition().lng();
               }
               //console.log(obj);
               socket.emit('init', obj);
                AbleToRecord = false;


            }else{
                AbleToRecord = false;
                $('#share').hide();
                connection.close();

                $('#share').html('<p style="color:#d6d6f5;">Lived on: </p><a onclick="window.open(\''+fileLocation+'\');" style="color:#ffffff;">'+fileLocation+'</a>');
                // $('#share').hide();


                //updateVideoFile();
                $("#record").removeClass("btn-danger").addClass("btn-primary");
            

                recButton.innerHTML = "Shoot";

            }
        }
    });
    map = document.getElementById('map');
    // console.log(map);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: {lat: 40.8075355, lng: -73.9625727},
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    // console.log(map);
    // getVideoStream();
    geo_marker = new google.maps.Marker({
        map: map,
        position: map.getCenter()
    });
  
    map.addListener('click', function(e) {
      geo_marker.setPosition(e.latLng);
      map.setZoom(17); 
      map.panTo(e.latLng);
      console.log(e.latLng.lat());
      if(AbleToRecord){

          //console.log(place.geometry.location.lat()+""+place.geometry.location.lng());
          var obj = new Object();
          obj.fbId=123;
          obj.lat = e.latLng.lat();
          obj.lng = e.latLng.lng();
      
          socket.emit('live_update', obj);
      
         
      }
    });


   
}