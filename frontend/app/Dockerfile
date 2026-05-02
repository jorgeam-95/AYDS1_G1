# ── Frontend Dockerfile ─────────────────────────────────────────────────────
# Etapa 1: Build
FROM node:18-alpine AS build

LABEL maintainer="SaludPlus Team"
LABEL description="Frontend React - SaludPlus Fase 2"

WORKDIR /app

# Copiar package files primero (caché de dependencias)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --silent

# Copiar código fuente
COPY . .

# Build de producción
ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV CI=false

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar build al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Configuración de Nginx para React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
