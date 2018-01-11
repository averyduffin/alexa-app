#!/usr/bin/env bash

apt-get update
apt-get install -y nodejs
apt-get install -y build-essential
apt-get install -y npm
npm install -g nodemon
npm install -g babel-cli
npm install -g babel-preset-es2015
npm install -g babel-preset-stage-2
ln -s /usr/bin/nodejs /usr/bin/node
