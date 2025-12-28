# --- ETAPA 1: Construcción (Builder) ---
FROM node:18-alpine AS builder

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de dependencias primero
# Esto permite cachear las capas de Docker y acelerar futuros builds
COPY package*.json ./

# Instalamos todas las dependencias
RUN npm install

# Copiamos el resto del código fuente del proyecto
COPY . .

# --- ETAPA 2: Producción (Runtime) ---
FROM node:18-alpine

# Definimos el entorno como producción para optimizar librerías (ej. Express, Sharp)
ENV NODE_ENV=production

# --- NUEVA SECCIÓN: Instalación de fuentes ---
# fontconfig: para gestionar las fuentes
# ttf-dejavu y font-noto: fuentes estándar de alta calidad
# font-noto-emoji: para que se vean los emojis si los usas
RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    font-noto \
    font-noto-cjk \
    font-noto-emoji \
    && fc-cache -f

WORKDIR /app

# Copiamos desde la etapa de 'builder' solo lo necesario
# 1. Los node_modules ya instalados
COPY --from=builder /app/node_modules ./node_modules
# 2. Los archivos de configuración de npm
COPY --from=builder /app/package*.json ./
# 3. El código fuente y assets
COPY --from=builder /app .

# Exponemos el puerto 3000 (el que configuramos en Traefik)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]