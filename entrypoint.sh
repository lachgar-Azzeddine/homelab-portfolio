#!/bin/sh
# Extract cluster DNS IP from resolv.conf for nginx resolver directive
RESOLVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)

# Substitute env vars — leave nginx variables like $uri untouched
envsubst '${POD_NAME}${NODE_NAME}${RESOLVER}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Write pod info as a static JSON file — Cloudflare-safe, no header stripping
cat > /usr/share/nginx/html/pod-info.json <<EOF
{
  "pod":  "${POD_NAME}",
  "node": "${NODE_NAME}"
}
EOF

exec nginx -g 'daemon off;'
