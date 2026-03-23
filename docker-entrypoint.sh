#!/bin/sh
set -e

# linuxserver.io-style user management
PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "──────────────────────────────────────"
echo "  PaintForge"
echo "  Setting up user abc ($PUID:$PGID)"
echo "──────────────────────────────────────"

# Remove existing abc user/group if present
deluser abc 2>/dev/null || true
delgroup abc 2>/dev/null || true

# Remove any user/group with conflicting UID/GID
existing_user=$(getent passwd "$PUID" | cut -d: -f1 2>/dev/null) || true
existing_group=$(getent group "$PGID" | cut -d: -f1 2>/dev/null) || true
[ -n "$existing_user" ] && deluser "$existing_user" 2>/dev/null || true
[ -n "$existing_group" ] && delgroup "$existing_group" 2>/dev/null || true

# Create abc group and user
addgroup -g "$PGID" abc
adduser -u "$PUID" -G abc -D -s /bin/sh abc

# Ensure directories are writable by abc
chown -R abc:abc /app/data /var/log/nginx /var/lib/nginx /run/nginx

# Start backend as unprivileged user
echo "Starting PaintForge API..."
su -s /bin/sh abc -c "cd /app/server && DB_PATH=/app/data/paintforge.db node index.js" &

# Start nginx (master binds port 80 as root, workers run as abc)
echo "Starting nginx..."
exec nginx -g "daemon off;"
