FROM registry.devneon.com.br/library/node:16-alpine

COPY . .
RUN npm ci && npm install -g typescript && tsc

ENTRYPOINT ["node", "/src/index.js"]
