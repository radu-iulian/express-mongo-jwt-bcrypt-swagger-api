FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci
RUN npm install nodemon --global
COPY . .
CMD ["nodemon", "start"]