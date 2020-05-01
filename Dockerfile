FROM node:14.10-alpine as build-deps

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./

ENTRYPOINT [ "node", "index.js" ]