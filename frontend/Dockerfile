# ─── Development stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
# --host binds Vite to 0.0.0.0 so Docker can forward the port to your machine
CMD ["npm", "run", "dev", "--", "--host"]

# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Vite bakes VITE_* vars into the JS bundle at build time, so they must arrive as build args
ARG VITE_API_BASE_URL
ARG VITE_EMAIL_TO_GENERATE_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_EMAIL_TO_GENERATE_TOKEN=$VITE_EMAIL_TO_GENERATE_TOKEN
COPY . .
RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]