FROM node:11.13.0

LABEL maintainer="void* <voidp@protonmail.com>"

USER root

ENV APP /usr/src/app

RUN npm install pm2 -g

COPY package.json /tmp/package.json

RUN cd /tmp && npm install --loglevel=warn \
  && mkdir -p $APP \
  && mv /tmp/node_modules $APP

COPY * $APP/

WORKDIR $APP

CMD [ "pm2-runtime", "index.js" ]
