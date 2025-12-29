#!/bin/sh
set -e

# Default to / if not provided
: "${VITE_API_BASE_URL:=/}"

# Generate runtime config used by the app
cat > /usr/share/nginx/html/config.js <<EOF
window.__API_BASE_URL__ = "${VITE_API_BASE_URL}";
EOF

exec nginx -g 'daemon off;'
