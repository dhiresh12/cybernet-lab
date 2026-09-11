FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    protobuf-dev

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000 50051

CMD ["node", "backend/server.js"]
