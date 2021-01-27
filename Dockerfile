FROM nginx

COPY ./dist/ /usr/share/nginx/html

COPY ./nginx/default.template /etc/nginx/conf.d/default.template

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

CMD sh -c "envsubst '\$API_HOST' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
