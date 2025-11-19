FROM node:20-slim AS build

# Install D2
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://d2lang.com/install.sh | sh -s -- && \
    mv /root/.local/bin/d2 /usr/local/bin/

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
