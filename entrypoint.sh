#!/bin/sh
# Substitute env vars — leave nginx variables like $uri untouched
envsubst '${POD_NAME}${NODE_NAME}${KUBE_DNS_IP}' \
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
