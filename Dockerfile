FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV APP_IP=0.0.0.0
ENV APP_PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
