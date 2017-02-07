# SOS extreme


## API keys
```java
vim server/.env


accountSid = "xxxxxxxxxxxxx"
authToken = "xxxxxxxxxxxxx"
toNumber = "xxxxxxxxxxxxx"
fromNumber = "xxxxxxxxxxxxx"
reverseGeo = "xxxxxxxxxxxxx"
computerVision = "xxxxxxxxxxxxx"
client_secret ="xxxxxxxxxxxxx"
client_id="xxxxxxxxxxxxx"
lyft="xxxxxxxxxxxxx"
```

## lyft 3-legged authorization
1. on your lyft developer app enter: http://localhost:9000/lyft
2. paste following to browser
```java
https://api.lyft.com/oauth/authorize?client_id=<YOUR_CLIENT_ID>&scope=public%20profile%20rides.read%20rides.request%20offline&state='test'&response_type=code
```

## run
1. [install node](https://nodejs.org/en/download/package-manager/) // sudo su to reinstall
2. npm install
3. cd server
4. node index.js
5. Point your browser to: [http://localhost:9000](http://localhost:9000) 

