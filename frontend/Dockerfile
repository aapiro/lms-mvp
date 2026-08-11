FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build-time arg to enable dev login in the built app
ARG VITE_ENABLE_DEV_LOGIN=false
ENV VITE_ENABLE_DEV_LOGIN=${VITE_ENABLE_DEV_LOGIN}

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
