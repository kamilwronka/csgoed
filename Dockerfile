FROM node:14.1.0-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./

ENTRYPOINT [ "node", "index.js" ]