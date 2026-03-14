import os
import glob

docs_path = "/Users/virul/Dev/makabasla-v2/docs"
files = glob.glob(f"{docs_path}/*.md")

replacements = {
    "Java 21": "Go 1.26",
    "Spring Boot 3.2.2 / 4.0.2": "Echo Framework",
    "Spring Boot 3.x": "Go",
    "Spring Boot 3.2.2": "Go 1.26",
    "Spring Cloud 2023.0.0": "Consul API / Viper",
    "Eureka Server": "Consul",
    "Netflix Eureka": "HashiCorp Consul",
    "Eureka-enabled": "Consul-enabled",
    "Eureka": "Consul",
    "eureka-server": "consul",
    "(localhost:8761)": "(localhost:8500)",
    "8761": "8500",
    "/actuator/health": "/health",
    "/api/auth/actuator/health": "/api/auth/health",
    "pom.xml": "go.mod",
    "Spring Web": "Echo",
    "Spring Data": "PostgreSQL",
    "JPA": "GORM/PostgreSQL",
    "mvn spring-boot:run": "go run cmd/main.go",
    "mvn clean install": "go build ./...",
    "parent POM": "main workspace",
    "Parent POM": "Main Workspace",
    "Actuator": "Health Check",
    "Spring Cloud Gateway": "API Gateway (Echo)",
    "Java Process": "Go Process",
    "Java": "Go",
    "JJWT 0.12.3": "golang-jwt/jwt/v5",
    "Lombok": "Go Structs"
}

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

print(f"Updated {len(files)} files in docs directory.")
