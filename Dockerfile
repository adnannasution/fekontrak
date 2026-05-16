# ---------- Builder (Vite) ----------
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=1536"
RUN node --max-old-space-size=1536 ./node_modules/vite/bin/vite.js build

# ---------- Runtime (Nginx) ----------
FROM nginx:alpine

# Copy hasil build
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config dengan SPA routing (try_files → index.html)
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]