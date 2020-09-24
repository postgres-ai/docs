FROM node:10.22

WORKDIR /app/

EXPOSE 3000
COPY ./ /app/

RUN npm install
RUN npm run build

CMD ["npm", "run", "serveserve"]
