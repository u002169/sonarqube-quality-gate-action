FROM public.ecr.aws/docker/library/node:16.16-alpine

COPY . .
RUN npm ci && npm install -g typescript && tsc

ENTRYPOINT ["node", "/src/index.js"]
