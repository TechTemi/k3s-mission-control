FROM node:18-alpine
WORKDIR /app
# Copy dependency files first (better Docker layer caching)
COPY package*.json ./
RUN npm install --production
# Copy the rest of the app
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]