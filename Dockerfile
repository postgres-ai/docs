FROM node:16.14

ARG ARG_REACT_APP_API_SERVER
ENV REACT_APP_API_SERVER=$ARG_REACT_APP_API_SERVER

ARG ARG_URL
ENV URL=$ARG_URL

ARG ARG_BASE_URL
ENV BASE_URL=$ARG_BASE_URL

ARG ARG_SIGN_IN_URL
ENV SIGN_IN_URL=$ARG_SIGN_IN_URL

WORKDIR /docs

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .
# Make cache folder if not exists.
RUN mkdir -p .cache
RUN mv .cache node_modules
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "serve"]
