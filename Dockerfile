# =========================
# ETAPA 1 - BUILD (Maven)
# =========================
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copia o backend
COPY backend /app

# Compila o projeto (sem testes)
RUN mvn clean package -DskipTests

# =========================
# ETAPA 2 - RUNTIME (Java)
# =========================
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copia apenas o JAR final
COPY --from=build /app/target/excedente-backend-1.0.0.jar app.jar

# Porta do Spring Boot
EXPOSE 8080

# Inicia a aplicação
CMD ["java", "-jar", "app.jar"]