#!/bin/bash

gulp build
cp -r build/* /var/www/wisper.chat/public/
cd build
node server.js # todo: stop using node to serve up static resources

