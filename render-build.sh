#!/usr/bin/env bash

# Update package lists
apt-get update

# Install Chromium dependencies
apt-get install -y wget --no-install-recommends \
   ca-certificates \
   fonts-liberation \
   libappindicator3-1 \
   libasound2 \
   libatk-bridge2.0-0 \
   libcups2 \
   libgbm1 \
   libnspr4 \
   libnss3 \
   libx11-xcb1 \
   libxcomposite1 \
   libxdamage1 \
   libxrandr2 \
   xdg-utils

# Clean up
apt-get clean
rm -rf /var/lib/apt/lists/*
