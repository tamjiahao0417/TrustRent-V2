FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libicu-dev \
    libpq-dev  # <-- ADD THIS LINE

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd intl pdo_pgsql

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Expose port
EXPOSE 8000

# Start command
CMD php artisan serve --host=0.0.0.0 --port=$PORT