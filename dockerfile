# Stage 1: Build the React app
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the app using Node.js and serve package
FROM node:18

# Set the working directory for the second stage
WORKDIR /app

# Install the 'serve' package globally to serve static files
RUN npm install -g serve

# Copy the build files from the first stage
COPY --from=build /app/build /app/build

# Expose the port on which the React app will be served
EXPOSE 3001

# Use serve to serve the static files
CMD ["serve", "-s", "build", "-l", "3001"]
