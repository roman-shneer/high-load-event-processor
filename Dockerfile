# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS react-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./

RUN npm run build

# --- Stage 2: Build NestJS Backend ---
FROM node:20-alpine AS nest-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY src ./src
COPY performance ./performance
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN mkdir -p client/dist
COPY --from=react-builder /app/client/dist ./client/dist
RUN npm run build

# --- Stage 3: Final Runtime Image ---
FROM node:20-alpine
WORKDIR /app
COPY --from=nest-builder /app/dist ./dist
COPY --from=nest-builder /app/node_modules ./node_modules
COPY --from=nest-builder /app/client/dist ./client/dist
COPY --from=nest-builder /app/performance ./performance
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/main"]