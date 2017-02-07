//
//  ViewController.swift
//  FBLiveAPI
//
//  Created by LeeSunhyoup on 2016. 9. 17..
//  Copyright © 2016년 Lee Sun-Hyoup. All rights reserved.
//

import UIKit
import CoreLocation
import SocketIO

class ViewController: UIViewController,CLLocationManagerDelegate, VCSessionDelegate {
    @IBOutlet var contentView: UIView!
    @IBOutlet var liveButton: UIButton!
    @IBOutlet var livePrivacyControl: UISegmentedControl!
    
    var session: VCSimpleSession!
    var livePrivacy: FBLivePrivacy = .closed
    var fbid = ""
    var fbname = ""
    var initUpload = true
    var locationManager = CLLocationManager()
    let socket = SocketIOClient(socketURL: URL(string: "http://54.221.40.5:9000")!, config: [.log(true), .forcePolling(true)])
    
   
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        liveButton.layer.cornerRadius = 15
        
        session = VCSimpleSession(videoSize: CGSize(width: 1280, height: 720), frameRate: 30, bitrate: 4000000, useInterfaceOrientation: false)
        contentView.addSubview(session.previewView)
        session.previewView.frame = contentView.bounds
        session.delegate = self
        if (CLLocationManager.locationServicesEnabled())
        {
            locationManager.delegate = self
            locationManager.desiredAccuracy = kCLLocationAccuracyBest
            locationManager.requestWhenInUseAuthorization()
            
            //start polling locations
            //locationManager.startUpdatingLocation()
        }
        else
        {
            #if debug
                println("Location services are not enabled");
            #endif           
        }
        socket.connect()
       
    }
 
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        
        
        let userLocation:CLLocation = locations[0]
        
        let latitude:CLLocationDegrees = userLocation.coordinate.latitude
        
        let longitude:CLLocationDegrees = userLocation.coordinate.longitude
        
   
        
        //print(latitude)
        
        //print(longitude)
        if (self.fbid != ""){
            if (self.initUpload){
                self.initUpload = false
                self.socket.emit("init", ["fbId": self.fbid,"fbName": self.fbname,"lat":latitude,"lng":longitude])
            }else{
                self.socket.emit("live_update", ["fbId": self.fbid,"fbName": self.fbname,"lat":latitude,"lng":longitude])
            }
        }
    }

    
  
    @IBAction func live() {
        switch session.rtmpSessionState {
        case .none, .previewStarted, .ended, .error:
            print("startlive")
            locationManager.startUpdatingLocation()
            startFBLive()
        default:
            print("endlive")
            locationManager.stopUpdatingLocation()
            self.initUpload = true
            endFBLive()
            break
        }
    }
    
    func startFBLive() {
        if FBSDKAccessToken.current() != nil {
            print(FBSDKAccessToken.current())
            FBLiveAPI.shared.startLive(privacy: .everyone) { result in
                print(result)
                
                guard let streamUrlString = (result as? NSDictionary)?.value(forKey: "stream_url") as? String else {
                    return
                }
                let streamUrl = URL(string: streamUrlString)
                
                guard let lastPathComponent = streamUrl?.lastPathComponent,
                    let query = streamUrl?.query else {
                        return
                }
                print(streamUrl as Any)
                self.session.startRtmpSession(
                    withURL: "rtmp://rtmp-api.facebook.com:80/rtmp/",
                    andStreamKey: "\(lastPathComponent)?\(query)"
                )
                
                self.livePrivacyControl.isUserInteractionEnabled = false
            }
        } else {
            fbLogin()
        }
    }
    
    func endFBLive() {
        if FBSDKAccessToken.current() != nil {
            FBLiveAPI.shared.endLive { _ in
                self.session.endRtmpSession()
                self.livePrivacyControl.isUserInteractionEnabled = true
            }
        } else {
            fbLogin()
        }
    }
    
    func fbLogin() {
        let loginManager = FBSDKLoginManager()
        
        loginManager.logIn(withPublishPermissions: ["publish_actions"], from: self) {
            (result, error) in
            if error != nil {
                print("Error")
            } else if result?.isCancelled == true {
                print("Cancelled")
            } else {
                loginManager.logIn(withReadPermissions: ["user_photos","email"], from: self) {
                    (result, error) in
                    if error != nil {
                        print("Error")
                    } else if result?.isCancelled == true {
                        print("Cancelled")
                    } else {
                        FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "id, name, first_name,last_name, picture.type(large),email,updated_time"]).start(completionHandler: { (connection, result, error) -> Void in
                            if (error == nil){
                                
                                if let userDict = result as? NSDictionary {
                                    let first_Name = userDict["first_name"] as! String
                                    let last_Name = userDict["last_name"] as! String
                                    let id = userDict["id"] as! String
                                    //let email = userDict["email"] as! String
                                    
                                    self.fbid = id
                                    self.fbname = first_Name+" "+last_Name
                                    //print(email)
                                    print(userDict)
                                    FBLiveAPI.shared.createAlbum(privacy: .everyone,name:"sos") { result in
                                        print(result)
                                        
                                    }
                                    //self.lbShow.text = "Hi " + first_Name
                                    //se/lf.show(active : true,name:first_Name)
                                }
                            }
                        })//end of user info
                    
                    }
                }//end of read permission
              
            }

        }//end of publish permission
    }
    
    @IBAction func changeLivePrivacy(sender: UISegmentedControl) {
        switch sender.selectedSegmentIndex {
        case 0:
            livePrivacy = .everyone
        case 1:
            livePrivacy = .closed
        case 2:
            livePrivacy = .allFriends
        case 3:
            livePrivacy = .friendsOfFriends
        default:
            break
        }
    }
    
    // MARK: VCSessionDelegate
    
    func connectionStatusChanged(_ sessionState: VCSessionState) {
        switch session.rtmpSessionState {
        case .starting:
            
            liveButton.setTitle("Conneting", for: .normal)
            liveButton.backgroundColor = UIColor.orange
        case .started:
            self.screenShotMethod()
            liveButton.setTitle("Cancel", for: .normal)
            liveButton.backgroundColor = UIColor.red
        default:
           
            liveButton.setTitle("Shoot", for: .normal)
            liveButton.backgroundColor = UIColor.green
        }
    }
    func screenShotMethod() {
        
        UIGraphicsBeginImageContextWithOptions(view.bounds.size, view.isOpaque , 0.0);
        self.view.drawHierarchy(in: view.bounds, afterScreenUpdates: false)
        
        let image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        //let imagePath =  self.fbid + String(Date().timeIntervalSince1970)
       // let imageURL = NSURL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true).appendingPathComponent(imagePath)?.appendingPathExtension("png")
        // print(imageURL as Any)
        // save image to URL
        
        //try UIImagePNGRepresentation(image!)?.write(to: imageURL!)
        FBSDKGraphRequest(graphPath: "me/photos", parameters: ["caption": "I am threatened. Please help. Watch my live location at http://54.221.40.5:9000/w/"+self.fbid  ,"sourceImage":UIImagePNGRepresentation(image!) as Any],httpMethod: "POST").start(completionHandler: { (connection, result, error) -> Void in
            if (error == nil){
                if let photoRes = result as? NSDictionary {
                    let picId = photoRes["id"] as! String
                    print(picId)
                    FBSDKGraphRequest(graphPath: picId+"/picture", parameters: ["redirect":false]).start(completionHandler: { (connection, result, error) -> Void in
                        if (error == nil){
                            if let photoUrl = result as? NSDictionary {
                                if let decode = photoUrl["data"]as? NSDictionary {
                                  
                                    print(decode["url"] as Any)
                                    if (self.fbid != ""){
                                       
                                            self.socket.emit("criminal_img", ["fbId": self.fbid,"url": decode["url"] as Any])
                                       
                                    }
                                }
                            }
                        }else{
                            print(error as Any)
                        }
                    })

                    
                    
                    
                    
                }
            }
            
        })
      
        
      
        
        UIImageWriteToSavedPhotosAlbum(image!, nil, nil, nil)
    }
}

