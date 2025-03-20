FROM node:20-alpine

WORKDIR app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80


ENTRYPOINT ["npm", "run", "dev", "--","--host", "--port", "80"]
# ENTRYPOINT ["/bin/sh", "-c", "npm run dev -- --host --port 80"]
# ENTRYPOINT ["npm", "run", "dev", "--", "--host", "--port", "80"]
# CMD ["npm", "run", "dev", "--", "--host", "--port", "80"]

