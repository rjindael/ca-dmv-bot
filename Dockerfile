FROM node:lts

WORKDIR /app
COPY . .

RUN npm install
RUN npm install -g pm2 babel-cli

CMD [ "pm2-runtime", "start", "pm2.json" ]
