FROM node:lts-buster

RUN apt-get update && \
    apt-get install -y graphicsmagick && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN npm install
RUN npm install -g pm2 babel-cli

CMD [ "pm2-runtime", "start", "pm2.json" ]
