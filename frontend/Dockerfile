FROM node:20-alpine

WORKDIR app

COPY package*.json ./

RUN npm install

COPY tsconfig*.json index.html vite.config.ts ./

COPY src ./src

COPY public ./public

COPY .env .env.production

RUN npm run build

EXPOSE 80


ENTRYPOINT ["npm", "run" , "preview", "--", "--port", "80", "--host"]
