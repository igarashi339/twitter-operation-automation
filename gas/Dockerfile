FROM node:lts-alpine
WORKDIR /code
COPY package.json ./
COPY package-lock.json ./
RUN npm i @google/clasp -g
RUN npm install