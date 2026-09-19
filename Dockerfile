# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_URL=/api/allprojects
ARG VITE_PORTFOLIO_URL=https://karanparmar.in
ARG VITE_SSO_URL=https://auth.karanparmar.in
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PORTFOLIO_URL=${VITE_PORTFOLIO_URL}
ENV VITE_SSO_URL=${VITE_SSO_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /index.html {
        add_header Cache-Control "no-store, max-age=0";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

LABEL org.opencontainers.image.source=https://github.com/Karan-parmar-007/all-projects-frontend
LABEL org.opencontainers.image.description="All projects frontend for app.karanparmar.in"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
