FROM node:lts-alpine
WORKDIR /code
COPY package.json ./
COPY package-lock.json ./
COPY .clasprc.json ../root/
RUN npm i @google/clasp -g
RUN npm install