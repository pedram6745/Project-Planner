# Multi-stage build for Project Planner (Tech PM Mission Control)

# Stage 1: Development
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

# Stage 2: Production
FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html

# Copy all application files directly
COPY index.html .
COPY *.tsx ./
COPY *.ts ./
COPY *.json ./
COPY components/ ./components/
COPY services/ ./services/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
