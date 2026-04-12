# Stage 1: Build Hugo site
FROM hugomods/hugo:exts AS builder
WORKDIR /site
COPY . .
RUN hugo --minify

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /site/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
