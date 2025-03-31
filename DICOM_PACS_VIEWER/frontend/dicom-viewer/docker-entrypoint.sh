#!/usr/bin/env sh
# docker-entrypoint.sh

# Replace placeholders in env.template.js with environment variables at runtime
echo "Generating env.js from env.template.js using environment variables..."

# We’ll put the results in env.js so it's served by NGINX
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# (Optional) If you want to see what we ended up generating:
# cat /usr/share/nginx/html/env.js

# Finally, launch NGINX
exec "$@"
