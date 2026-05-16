# ---------- Builder (Vite) ----------
FROM node:18-alpine AS builder
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci || npm install

# copy source & build (naikkan heap supaya tidak OOM)
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=1536"
RUN node --max-old-space-size=1536 ./node_modules/vite/bin/vite.js build

# ---------- Runtime (Nginx) ----------
FROM nginx:alpine
# kalau pakai client-side routing (SPA), aktifkan config fallback ke index.html (lihat komentar di bawah)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# salin hasil build ke root web
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
