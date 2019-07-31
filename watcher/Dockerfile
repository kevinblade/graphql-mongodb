# baisc image
FROM node:latest

# create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./
# Only copy package.json for good cached Docker layers
# http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/

ENV YARN_VERSION 1.16.9

RUN apt-get update && apt-get install -y yarn

# If you are building your code for production
# RUN npm install --only=production
RUN yarn

# Bundle app source
COPY . .

# launch runtime you define
CMD [ "yarn", "start" ]

# further reading
# https://github.com/nodejs/docker-node