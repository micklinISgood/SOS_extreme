# SOS_extreme
![SOS](https://github.com/micklinISgood/SOS_extreme/blob/master/Images/sos.png)
##Inspiration
[link](https://maps.nyc.gov/crime/) Here is the map for NYC crime. As a resident in New York city, we are very concerned about our safety. Therefore, we created an app to save our lives in emergency situation.

##What it does
In emergency situation, our app will trigger twilio api to call your emergency contact eg. 911, report your situation and your current location. It will also videotape your surrounding environment and put the video on facebook live. Remember to take a photo of the person threatening you. Our app will identify some characteristic of the suspect, put the picture and his description on SOS Extreme live website together with you current location. At the same time, our app will query the nearby police station using google map api and help you request a lyft ride to get you out of danger as soon as possible. Later, the suspect image and the video uploaded onto website can also serve as evidence for police investigation.

##How we built it
In this application, we utilized different apis to achieve our goal. For example, we use Twilio API to help call police, Google Map API to report current location, Lyft API to request a ride and Microsoft Computer Vision API on image recognition. Our mainframe work is an IOS application, and we also used node.js and javascript in building the website and integrated different APIs.

##Challenges we ran into
First, this is the first time we build an IOS application, we ran into many library dependency issues which took us a lot of time to resolve. Second, we implement a couple of different APIs in our project, such as Lyft API, Twilio API, Microsoft Computer Vision API and Google Map API, how to use and integrate them into one cohesive project is quite a challenge as well. Third, we are unfamiliar with node.js before and this project enhanced our ability in using it.

##Accomplishments that we're proud of
We are proud of the comprehensive services our APP provides when encountering emergency situations. Every use of an API is an step to keep you away from danger.

##What we learned
We learned how to break one goal into different pieces and use different APIs to help us accomplish our goal. We also learned how to build an IOS application.

##What's next for SOS Extreme
Our next step is to further refine our APP’s interface to make it easier for people to use. And maybe we can cooperate with the police department and companies like Facebook and Lyft to further develop our APP to make it more private and helpful.

##Built With
node.js
javascript
microsoft-cognitive-api
lyft
facebook-graph
facebook-live
google-maps
twilio
swift
