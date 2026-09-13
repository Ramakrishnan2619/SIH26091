# ==============================================================================
# Stage 1: Build React Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Build Spring Boot Backend (Bundling Frontend into static resources)
# ==============================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app

# Cache dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Copy backend source
COPY src ./src

# Copy compiled frontend assets into Spring Boot static resources directory
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

# Package application jar
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 3: Production Minimal JRE Runtime for Google Cloud Run
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install sqlite runtime support if needed
RUN apk add --no-cache sqlite-libs

# Copy application JAR
COPY --from=backend-builder /app/target/*.jar app.jar

# Copy Layer 2 static database into container for high-speed local queries
COPY ["Optimized DB for Layer 2", "/app/Optimized DB for Layer 2"]

# Cloud Run injects PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Run with container optimizations
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
