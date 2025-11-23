FROM oven/bun:1 AS build

# Install D2 and build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    make \
    && curl -fsSL https://d2lang.com/install.sh | sh -s -- \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/local/bin:${PATH}"

WORKDIR /app

# Install dependencies with Bun (much faster than npm)
COPY package.json ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# Copy source and build
COPY . .
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Set proper permissions and optimize nginx
RUN chmod -R 755 /usr/share/nginx/html \
    && chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
