FROM node:20-bookworm-slim as builder

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl libssl3 \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

# Production stage
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl libssl3 \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
