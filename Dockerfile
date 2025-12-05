# Dockerfile for Project Planner (Tech PM Mission Control)

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Default to development server
CMD ["npm", "run", "dev"]
