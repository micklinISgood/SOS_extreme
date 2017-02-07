<h1 align="center">FBLiveAPISample for iOS</h1>

<div align="center">
<img src="https://github.com/micklinISgood/SOS_extreme/blob/master/Images/app.jpeg?raw=true" width='30%'>

</div>





## How to Run?
1. First, create your Facebook app. [Link](https://developers.facebook.com/)

2. Clone this repository

    ```
    $ git clone https://github.com/kciter/FBLiveAPISample-iOS
    ```
3. Open `FBLiveAPISample.xcworkspace`.

4. Open `Info.plist` as Property List.

5. Edit
```java
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fb{your-app-id}</string>
    </array>
  </dict>
</array>
<key>FacebookAppID</key>
<string>{your-app-id}</string>
<key>FacebookDisplayName</key>
<string>{your-app-name}</string>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>fbapi</string>
  <string>fb-messenger-api</string>
  <string>fbauth2</string>
  <string>fbshareextension</string>
</array>
<key>NSPhotoLibraryUsageDescription</key>
  <string>{human-readable reason for photo access}</string>
```

6. Connect!<br>
<div align="center">
  <img src="https://github.com/micklinISgood/SOS_extreme/blob/master/Images/fb%20photo.png?raw=true" width='50%'>
  <img src="https://github.com/micklinISgood/SOS_extreme/blob/master/Images/fb%20live.png?raw=true" width='50%'>
</div>
