FROM node:lts-alpine

RUN apk add --no-cache graphicsmagick

WORKDIR /app
COPY . .

RUN npm install
RUN npm install -g pm2 babel-cli

CMD ["pm2-runtime", "start", "pm2.json"]