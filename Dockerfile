FROM node:16 as build

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:16

WORKDIR /app

COPY --from=build /app/dist/ /app/package*.json ./
RUN npm ci --production

ENTRYPOINT ["node", "./client.js"]
