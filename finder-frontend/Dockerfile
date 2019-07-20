FROM nginx:alpine
ENV NODE_ENV production
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./dist/ /usr/share/nginx/html/