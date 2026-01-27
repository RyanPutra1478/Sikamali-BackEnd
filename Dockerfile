FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dan install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code backend
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]
