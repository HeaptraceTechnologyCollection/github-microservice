FROM node:current-alpine

RUN npm install github-api
ADD index.js index.js

ENTRYPOINT ["node", "index.js"]
