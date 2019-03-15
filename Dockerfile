FROM node:10.14.2 as nodejs
ENV NPM_CONFIG_LOGLEVEL "http"


FROM nodejs
ENV NODE_ENV "production"
WORKDIR /containerapp
WORKDIR /containerapp/server
COPY ./server/package*.json ./
RUN npm install
COPY ./server .


ENV NUMBER_OF_WORKERS "1"
ENV SECRET_KEY_1 "isadbf8734qgho3q4hfoq39f4hqfh0q37fuhauiosdfj90q87rhf"
ENV SECRET_KEY_2 "39f"
ENV SERVER_PORT "8110"
ENV CLIENT_ID "6019fe32384341dd9afa43cbb528b0ef"
ENV	CLIENT_SECRET "77bad0174a2e4310a07a7237268c4f8e"

USER node
