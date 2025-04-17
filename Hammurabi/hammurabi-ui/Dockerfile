# --------------------------
# Stage 1: Build the React app
# --------------------------
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy the rest of your code
COPY . . 

# IMPORTANT: do NOT rely on .env here.
RUN npm run build

# --------------------------
# Stage 2: Serve w/ Nginx, injecting runtime env
# --------------------------
FROM nginx:alpine

# Install envsubst (part of the 'gettext' package) so we can do variable substitution
RUN apk add --no-cache gettext

# Remove default config & copy our custom
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy the environment config template & entrypoint
COPY env-config.js.template /usr/share/nginx/html/env-config.js.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Use our entrypoint to generate env-config.js at runtime
ENTRYPOINT ["/entrypoint.sh"]
# Then run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
