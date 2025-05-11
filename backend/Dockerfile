FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost:5000/ || exit 1
CMD ["node", "index.js"]
