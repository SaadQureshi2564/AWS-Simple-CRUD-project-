# Use official Node.js image for build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use a lightweight web server for static files
FROM node:18-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 8080
CMD ["serve", "-s", "build", "-l", "8080"]