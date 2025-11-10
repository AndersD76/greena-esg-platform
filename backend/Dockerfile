# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev) for build
# Sem Puppeteer, build otimizado (~2min)
RUN npm install --no-audit --no-fund --prefer-offline

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . ./

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and prisma
COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies
RUN npm install --production --no-audit --no-fund

# Generate Prisma client for production
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start command (run migrations then start)
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
