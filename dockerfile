# Use a specific Node version with Alpine for a smaller image
FROM node:20.11.1-alpine

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (for layer caching)
COPY package*.json ./

# Optional: Clean npm cache and install deps with compatibility
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app (NestJS -> dist/)
RUN npm run build

# Expose port your app uses (adjust if needed)
EXPOSE 3000

# Start with migrations and prod server
CMD ["npm", "run", "start:migrate:prod"]