# Stage 1: Build the React App
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code, including .env
COPY . .

# Ensure your .env file is copied (if needed)
COPY .env .env

# Build the app so that the REACT_APP_* variables from .env are injected
RUN npm run build

# Stage 2: Serve the App with Nginx
FROM nginx:alpine

# Remove the default NGINX configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom NGINX configuration into the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the previous stage into NGINX's html folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the container
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
