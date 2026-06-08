FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install production dependencies only
FROM base AS deps
RUN apk add --no-cache python3 g++ make
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the application
FROM base AS build
RUN apk add --no-cache python3 g++ make
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV DATABASE_URL="file:./data/stasis.db"
RUN npx prisma generate
RUN npm run build

# Production runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma

# Copy Prisma generated client and engine binaries into standalone's node_modules
COPY --from=build /app/node_modules/.prisma ./.next/standalone/node_modules/.prisma

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
