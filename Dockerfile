# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configuration files
COPY package.json package-lock.json* ./

# Install dependencies
# Using --frozen-lockfile is best practice for CI/CD
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine AS runner

# Copy the custom Nginx configuration
# This config is set up to handle single-page applications (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
