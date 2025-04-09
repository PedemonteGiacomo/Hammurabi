# Stage 1: Build the React app.
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies.
COPY package*.json ./
RUN npm install

# Copy the source code and build the app.
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx.
FROM nginx:alpine

# Copy the build folder from the previous stage to Nginx's public folder.
COPY --from=build /app/build /usr/share/nginx/html

# (Optional) Copy a custom Nginx configuration if needed.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]