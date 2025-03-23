# Build stage
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean

COPY . .
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:23-jre AS runtime
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]