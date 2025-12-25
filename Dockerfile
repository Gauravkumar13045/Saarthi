# --- Stage 1: Build the React App ---
# We start with a lightweight Node.js environment
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to install dependencies efficiently
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your project files
COPY . .

# 1. Accept the API key as a "Build Argument" from Google Cloud
ARG GEMINI_API_KEY

# 2. Write it into a .env.local file so Vite can see it during the build
# Note: In Vite, usually env vars must start with VITE_ to be exposed to the browser.
# If your code expects VITE_GEMINI_API_KEY, change the line below to:
# RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local
RUN echo "GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Build the app (creates a 'dist' folder)
RUN npm run build

# --- Stage 2: Serve with Nginx ---
# Now we switch to Nginx, a very fast web server
FROM nginx:alpine

# Copy the built app from the previous stage to Nginx's public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Google Cloud Run expects us to listen on port 8080
EXPOSE 8080

# Start Nginx in the foreground so the container keeps running
CMD ["nginx", "-g", "daemon off;"]
