FROM node:10.17.0-jessie

WORKDIR /app/website

EXPOSE 3000
COPY ./docs /app/docs
COPY ./website /app/website

RUN npm install

CMD ["npm", "start"]
