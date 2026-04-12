#!/bin/sh
# Substitute only POD_NAME and NODE_NAME — leave nginx variables like $uri untouched
envsubst '${POD_NAME}${NODE_NAME}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
