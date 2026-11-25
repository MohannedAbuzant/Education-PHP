# Production image for Railway (or any Docker host).
# Build:  docker build -t course-portal .
# Run:    docker run -p 8080:8080 --env-file .env.production course-portal

# --- 1. Build the front end (Vite) ---------------------------------------
FROM node:22-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- 2. Install PHP dependencies without dev packages ---------------------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-interaction

# --- 3. Runtime: PHP 8.3 + nginx -----------------------------------------
FROM serversideup/php:8.3-fpm-nginx AS production

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PHP_OPCACHE_ENABLE=1 \
    AUTORUN_ENABLED=true

WORKDIR /var/www/html

COPY --chown=www-data:www-data --from=vendor /app /var/www/html
COPY --chown=www-data:www-data --from=assets /app/public/build /var/www/html/public/build

# .dockerignore strips the contents of storage/ (including the .gitignore
# placeholders), so recreate the writable folders Laravel needs.
USER root
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache
USER www-data

# AUTORUN_ENABLED runs `php artisan migrate --force`, `storage:link` and
# `optimize` when the container starts. Nothing here needs APP_KEY at build time:
# set APP_KEY and the DB_* variables on the host (see README).
EXPOSE 8080
