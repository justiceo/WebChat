# WebSMS

A web interface for Wisper SMS

#### installing
You would need the redis binary (in addition to the npm ones)
```
sudo apt-get install redis-server
sudo systemctl enable redis-server.service # enable on system boot
```

#### deploying with pm2
NODE_ENV=production pm2 start server.js --name="webSMS" --watch

#### to build docker image
// -d allow it to run in background (detach from shell)
 sudo docker build -f Dockerfile -t websms:latest .

#### to run the image
 sudo docker run --name websms_container -p 4000:4000 -i -td websms:latest

 on aws:
 sudo env "PATH=$PATH" npm start

### todo
---------
* write the code on paper - spending too much time looking at the screen bro
* migrate to typescript
* add unit tests for ui components
* bug - phone simulator can re-activate new clients with same old token
* flesh out phone-simulator and use for testing as it's faster than app
* confirm that phone id isn't 0000s when on server
* only dismiss scanner view after a second trial, or make authtokens last longer
