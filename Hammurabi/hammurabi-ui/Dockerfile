# ------------------------------------------------------------------
# Stage 1 – build del front‑end React
# ------------------------------------------------------------------
FROM node:18-alpine AS build

ARG VERSION_INFO=dev
WORKDIR /app
    
# ------------------------------------------------------------
# 1. copia solo i manifest                (— cache layer —)
# ------------------------------------------------------------
COPY package*.json ./
    
# ------------------------------------------------------------
# 2. risolve il conflitto vite/vitest → @types/node >= 18
#    * sovrascrive solo il lock‑file, NON scarica i pacchetti
#    * poi `npm ci` funziona senza errori
# ------------------------------------------------------------
RUN npm pkg set overrides.@types/node="^20" \
 && npm install --package-lock-only --ignore-scripts \
 && npm ci                        # installazione pulita
    
# 3. copia il resto del codice
COPY . .
    
# 4. variabile build‑time per CRA
ENV REACT_APP_VERSION=$VERSION_INFO
    
RUN npm run build
    
# ------------------------------------------------------------------
# Stage 2 – Nginx + entrypoint che inietta la config runtime
# ------------------------------------------------------------------
FROM nginx:alpine
ARG VERSION_INFO=dev
    
RUN apk add --no-cache gettext
    
# config Nginx custom
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
    
# artefatti build
COPY --from=build /app/build /usr/share/nginx/html
    
# template + entrypoint
COPY env-config.js.template /usr/share/nginx/html/env-config.js.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
    
LABEL version=$VERSION_INFO
EXPOSE 80
    
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]