# WebSMS

A web interface for Wisper SMS

#### deploying with pm2
NODE_ENV=production pm2 start server.js --name="webSMS" --watch

#### to build docker image
 sudo docker build -f Dockerfile -t websms:latest .

#### to run the image
 sudo docker run -i -t websms:latest

### todo
---------
* write the code on paper - spending too much time looking at the screen bro
* prep lesson - it will take real time!!! filled with assignments too
* take a break from it to work on kasoma and wassets tomorrow
* write script to deploy server.js to cloud
* flesh out phone-simulator and use for testing as it's faster than app
* confirm that phone id isn't 0000s when on server
* only dismiss scanner view after a second trial, or make authtokens last longer
