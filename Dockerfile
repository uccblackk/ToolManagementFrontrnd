FROM node:15.5.1-alpine
ENV NODE_ENV=development
ENV HOST 0.0.0.0
RUN mkdir -p /app
COPY . /app
WORKDIR /app
#安裝python gcc g++
#https://blog.cloud-acct.com/posts/u-docker-nuxtjs-vuetify-install/
RUN apk update
RUN apk upgrade
RUN apk add --no-cache make gcc g++ python
RUN npm install
RUN npm run build
RUN npm run generate
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
