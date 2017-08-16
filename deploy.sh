#!/bin/bash

gulp build
ssh -p1022 justice@wisper.chat 'rm -r /home/justice/code/websms/build/*'
scp -r -P 1022 ./build/* justice@wisper.chat:/home/justice/code/websms/build/
ssh -p1022 justice@wisper.chat 'cd /home/justice/code/websms/build && NODE_ENV=production /usr/bin/node server.js'

