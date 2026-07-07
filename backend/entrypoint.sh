#!/bin/sh
echo "======================================"
echo "PG Finder - Environment Debug"
echo "======================================"
echo "SPRING_DATASOURCE_URL: [${SPRING_DATASOURCE_URL:-NOT SET}]"
echo "DATABASE_URL: [${DATABASE_URL:-NOT SET}]"
echo "SPRING_PROFILES_ACTIVE: [${SPRING_PROFILES_ACTIVE:-NOT SET}]"
echo "CORS_ORIGINS: [${CORS_ORIGINS:-NOT SET}]"
echo "======================================"
exec java -jar app.jar
