# ------------------------------------------------------------------
# Stage 1 – build del front‑end React
# ------------------------------------------------------------------
    
FROM node:18-alpine AS build

    # ► TAG di versione passato dalla pipeline; default = dev
ARG VERSION_INFO=dev
    
WORKDIR /app
    
    # Solo i package* per sfruttare la cache layer
COPY package*.json ./
RUN npm ci --legacy-peer-deps
    
    # Copia il resto del codice
COPY . .
    
    # Espone la versione al processo di build CRA
    #   👉 will be available in React as process.env.REACT_APP_VERSION
ENV REACT_APP_VERSION=$VERSION_INFO
    
    # IMPORTANT: non usare .env qui – le variabili runtime saranno iniettate
RUN npm run build
    
    
    # ------------------------------------------------------------------
    # Stage 2 – Nginx + entrypoint che inietta la config runtime
    # ------------------------------------------------------------------
FROM nginx:alpine
    
    # Rendi disponibile lo stesso ARG anche in questo stage
ARG VERSION_INFO=dev
    
    # Serve per envsubst
RUN apk add --no-cache gettext
    
    # Config Nginx custom
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Output della build
COPY --from=build /app/build /usr/share/nginx/html
    
    # Template JS + entrypoint
COPY env-config.js.template /usr/share/nginx/html/env-config.js.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
    
    # Etichetta utile (es. per ECR & traceability)
LABEL version=$VERSION_INFO
    
EXPOSE 80
    
    # Genera env‑config.js e poi resta in foreground
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
    