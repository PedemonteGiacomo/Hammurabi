# 1) Build React static files
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . . 
RUN npm run build

# 2) Stage for serving via NGINX
FROM nginx:stable-alpine

# Copy the React build
COPY --from=builder /app/build /usr/share/nginx/html

# Copy our env template into the same directory
COPY env.template.js /usr/share/nginx/html/env.template.js

# Copy a custom entrypoint script (explained below)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
