#!/bin/sh
# entrypoint.sh
# 1) Copies env-config.js.template => env-config.js using envsubst
# 2) Then executes the CMD passed by Docker (which is "nginx -g 'daemon off;'" by default).

echo "Generating env-config.js from template..."
# Make sure env-config.js.template is in the same directory we copy into the final image
# and that we have the necessary environment variables. 
# The simplest approach is to put env-config.js.template in /usr/share/nginx/html

envsubst < /usr/share/nginx/html/env-config.js.template \
         > /usr/share/nginx/html/env-config.js

echo "Starting Nginx..."
exec "$@"
