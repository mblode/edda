FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Build
COPY tsconfig.json tsdown.config.ts ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 22

CMD ["node", "dist/index.mjs"]
