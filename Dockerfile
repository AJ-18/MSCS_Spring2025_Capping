# Stage 1: Build the Spring Boot application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY spar/ ./spar/
WORKDIR /app/spar
RUN mvn clean package -DskipTests

# Stage 2: Run the built JAR
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app
COPY --from=build /app/spar/target/spar-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
