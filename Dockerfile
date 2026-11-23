# The site is built by CI (npm run build, then the resume PDF) into dist/.
# This image only serves it, as a non-root user.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
EXPOSE 8080
