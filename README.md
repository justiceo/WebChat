# WebChat | WhatsApp Clone

A clone of WhatsApp Web using the base of WebChat. 

* QR Code is generated using [angular2-qrcode](https://www.npmjs.com/package/angular2-qrcode)
* Extensive use of [@angular/flex-layout](https://github.com/angular/flex-layout) over bootstrap flex.
* Users in threads-list generated using the [RandomUser API](https://randomuser.me/)
* Messages in threads generated using the [Talaikis Quotes Api](https://talaikis.com/api/quotes/)


### Auth screen
![Auth Screen](src/assets/auth.png)


### Chat screen
![Chat Screen](src/assets/chat.png)


## Proposed Features
* Send and receive messages (real & automated)
* Send different kinds of content as message (images, videos, plain text, emoji)
* Group messaging
* Documentation
* Unit testing
* Notifications (new message, battery status, title bar, enable notifications)
* Cherry picking into v2


### NPM Gotchas
- Nodemon repeatedly spawning new processes? Kill it before it kills your machine. 
- Ensure the processes that are being started aren't already running in the background: node, ng, gulp, nodemon, redis-server.