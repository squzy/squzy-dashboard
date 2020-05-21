FROM nginx:1.13.0-alpine

RUN apk add --no-cache nginx-mod-http-perl=1.10.3-r1

COPY ./dist/ /usr/share/nginx/html

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
