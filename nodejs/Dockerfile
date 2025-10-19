FROM node:22.20.0-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.json .env ./
RUN npm install
RUN npm i typescript
COPY . .
CMD ["/bin/ash", "-c", "npm run build;npm run start"]