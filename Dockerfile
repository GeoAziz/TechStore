# Dockerfile for TechStore (Next.js)

# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy rest of the app
COPY . .

# Expose port 3000
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
