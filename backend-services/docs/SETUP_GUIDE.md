# Spring Boot 3.x Microservices Architecture Guide

**Stack**: Java 21, Spring Boot 3.x, Spring Cloud 2023.x, Maven, PostgreSQL, JWT, React

---

## PART 1 – EUREKA SERVER

### Required Dependencies

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

### Complete pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.2</version>
        <relativePath/>
    </parent>

    <groupId>com.makabas</groupId>
    <artifactId>eureka-server</artifactId>
    <version>1.0.0</version>
    <name>eureka-server</name>
    <description>Service Discovery Server</description>

    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>

        <!-- Optional: Actuator for health checks -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### application.yml Configuration

```yaml
server:
  port: 8761

spring:
  application:
    name: eureka-server

eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
  server:
    enable-self-preservation: false
    eviction-interval-timer-in-ms: 4000

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

### Main Application Class

```java
package com.makabas.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

### How to Run

```bash
cd eureka-server
mvn clean install
mvn spring-boot:run
```

### Dashboard URL

```
http://localhost:8761
```

### Common Issues and Fixes

| Issue                       | Solution                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| **Port already in use**     | Change `server.port` in application.yml or kill process on 8761  |
| **Self-registration error** | Ensure `register-with-eureka: false` and `fetch-registry: false` |
| **Services not showing**    | Check microservice `eureka.client.service-url.defaultZone`       |
| **Connection refused**      | Verify Eureka server is running before starting services         |

---

## PART 2 – SPRING CLOUD GATEWAY

### Required Dependencies

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<!-- JWT Validation -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

### Complete pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.2</version>
        <relativePath/>
    </parent>

    <groupId>com.makabas</groupId>
    <artifactId>api-gateway</artifactId>
    <version>1.0.0</version>
    <name>api-gateway</name>
    <description>API Gateway Service</description>

    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### application.yml Configuration

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      routes:
        # User Service Routes
        - id: user-service
          uri: lb://USER-SERVICE
          predicates:
            - Path=/api/users/**
          filters:
            - RewritePath=/api/users/(?<segment>.*), /${segment}
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20

        # Order Service Routes
        - id: order-service
          uri: lb://ORDER-SERVICE
          predicates:
            - Path=/api/orders/**
          filters:
            - RewritePath=/api/orders/(?<segment>.*), /${segment}

      # Global CORS Configuration
      globalcors:
        cors-configurations:
          "[/**]":
            allowed-origins:
              - "http://localhost:3000"
              - "http://localhost:5173"
            allowed-methods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowed-headers: "*"
            allow-credentials: true
            max-age: 3600

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true

# JWT Configuration
jwt:
  secret: your-256-bit-secret-key-here-change-in-production
  expiration: 86400000

management:
  endpoints:
    web:
      exposure:
        include: health,info,gateway
  endpoint:
    gateway:
      enabled: true

logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    reactor.netty.http.client: DEBUG
```

### Main Application Class

```java
package com.makabas.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

### Global Logging Filter

```java
package com.makabas.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import reactor.core.publisher.Mono;

@Configuration
public class GlobalFiltersConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(GlobalFiltersConfiguration.class);

    @Bean
    @Order(1)
    public GlobalFilter customGlobalFilter() {
        return (exchange, chain) -> {
            logger.info("Request URI: {}", exchange.getRequest().getURI());
            logger.info("Request Method: {}", exchange.getRequest().getMethod());
            logger.info("Request Headers: {}", exchange.getRequest().getHeaders());

            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                logger.info("Response Status Code: {}",
                    exchange.getResponse().getStatusCode());
            }));
        };
    }
}
```

### JWT Validation Filter

```java
package com.makabas.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${jwt.secret}")
    private String secret;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // Add user info to headers for downstream services
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", claims.getSubject())
                        .header("X-User-Email", claims.get("email", String.class))
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                return onError(exchange, "Unauthorized: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    public static class Config {
        // Configuration properties if needed
    }
}
```

### Apply JWT Filter to Routes (Updated application.yml)

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://USER-SERVICE
          predicates:
            - Path=/api/users/**
          filters:
            - RewritePath=/api/users/(?<segment>.*), /${segment}
            - JwtAuthenticationFilter # Apply JWT filter

        # Public routes (no JWT required)
        - id: auth-service-public
          uri: lb://USER-SERVICE
          predicates:
            - Path=/api/auth/**
          filters:
            - RewritePath=/api/auth/(?<segment>.*), /auth/${segment}
```

### Load Balancing with Eureka

**How it works:**

1. Gateway queries Eureka for service instances using service name (e.g., `USER-SERVICE`)
2. Eureka returns list of available instances with their host:port
3. Spring Cloud LoadBalancer uses **Round Robin** by default to distribute requests
4. If an instance is down, it's automatically removed from the pool

**Custom Load Balancer Configuration:**

```java
package com.makabas.gateway.config;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.RandomLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class LoadBalancerConfiguration {

    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
                loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
                name);
    }
}
```

---

## PART 3 – SAMPLE MICROSERVICES

### USER-SERVICE

#### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.2</version>
        <relativePath/>
    </parent>

    <groupId>com.makabas</groupId>
    <artifactId>user-service</artifactId>
    <version>1.0.0</version>
    <name>user-service</name>

    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

#### application.yml

```yaml
server:
  port: 8081

spring:
  application:
    name: user-service
  datasource:
    url: jdbc:postgresql://localhost:5432/userdb
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${random.value}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

#### Main Application Class

```java
package com.makabas.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

#### User Entity

```java
package com.makabas.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
}
```

#### User Repository

```java
package com.makabas.userservice.repository;

import com.makabas.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

#### User REST Controller

```java
package com.makabas.userservice.controller;

import com.makabas.userservice.entity.User;
import com.makabas.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setName(userDetails.getName());
                    user.setEmail(userDetails.getEmail());
                    user.setPhone(userDetails.getPhone());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("User Service is UP");
    }
}
```

---

### ORDER-SERVICE

#### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.2</version>
        <relativePath/>
    </parent>

    <groupId>com.makabas</groupId>
    <artifactId>order-service</artifactId>
    <version>1.0.0</version>
    <name>order-service</name>

    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

#### application.yml

```yaml
server:
  port: 8082

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:postgresql://localhost:5432/orderdb
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${random.value}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

#### Main Application Class

```java
package com.makabas.orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

#### Order Entity

```java
package com.makabas.orderservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @PrePersist
    public void prePersist() {
        this.orderDate = LocalDateTime.now();
    }
}
```

#### Order Repository

```java
package com.makabas.orderservice.repository;

import com.makabas.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
}
```

#### Order REST Controller

```java
package com.makabas.orderservice.controller;

import com.makabas.orderservice.entity.Order;
import com.makabas.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(orderRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Order Service is UP");
    }
}
```

---

## PART 4 – PROJECT STRUCTURE

```
makabasla-v2/
├── backend-services/
│   ├── eureka-server/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/makabas/eureka/
│   │   │       │       └── EurekaServerApplication.java
│   │   │       └── resources/
│   │   │           └── application.yml
│   │   └── pom.xml
│   │
│   ├── api-gateway/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/makabas/gateway/
│   │   │       │       ├── ApiGatewayApplication.java
│   │   │       │       ├── filter/
│   │   │       │       │   ├── GlobalFiltersConfiguration.java
│   │   │       │       │   └── JwtAuthenticationFilter.java
│   │   │       │       └── config/
│   │   │       │           └── LoadBalancerConfiguration.java
│   │   │       └── resources/
│   │   │           └── application.yml
│   │   └── pom.xml
│   │
│   ├── user-service/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/makabas/userservice/
│   │   │       │       ├── UserServiceApplication.java
│   │   │       │       ├── controller/
│   │   │       │       │   └── UserController.java
│   │   │       │       ├── entity/
│   │   │       │       │   └── User.java
│   │   │       │       └── repository/
│   │   │       │           └── UserRepository.java
│   │   │       └── resources/
│   │   │           └── application.yml
│   │   └── pom.xml
│   │
│   └── order-service/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── com/makabas/orderservice/
│       │       │       ├── OrderServiceApplication.java
│       │       │       ├── controller/
│       │       │       │   └── OrderController.java
│       │       │       ├── entity/
│       │       │       │   └── Order.java
│       │       │       └── repository/
│       │       │           └── OrderRepository.java
│       │       └── resources/
│       │           └── application.yml
│       └── pom.xml
│
└── frontend/
    └── (React app)
```

---

## PART 5 – TESTING FLOW

### Request Flow Diagram

```
React (localhost:3000)
    ↓
API Gateway (localhost:8080)
    ↓
Queries Eureka Server (localhost:8761)
    ↓
Routes to Microservice
    ↓
USER-SERVICE (localhost:8081) or ORDER-SERVICE (localhost:8082)
```

### Startup Sequence

```bash
# 1. Start Eureka Server
cd eureka-server
mvn spring-boot:run

# 2. Wait 10 seconds, then start API Gateway
cd ../api-gateway
mvn spring-boot:run

# 3. Start User Service
cd ../user-service
mvn spring-boot:run

# 4. Start Order Service
cd ../order-service
mvn spring-boot:run
```

### Create PostgreSQL Databases

```bash
# Connect to PostgreSQL
psql -U postgres

# Create databases
CREATE DATABASE userdb;
CREATE DATABASE orderdb;

# Exit
\q
```

### cURL Test Examples

#### Test Eureka Dashboard

```bash
curl http://localhost:8761
```

#### Test Gateway Health

```bash
curl http://localhost:8080/actuator/health
```

#### Create User (via Gateway)

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }'
```

#### Get All Users (via Gateway)

```bash
curl http://localhost:8080/api/users
```

#### Get User by ID (via Gateway)

```bash
curl http://localhost:8080/api/users/1
```

#### Create Order (via Gateway)

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productName": "Laptop",
    "quantity": 2,
    "totalPrice": 2000.00
  }'
```

#### Get Orders by User ID (via Gateway)

```bash
curl http://localhost:8080/api/orders/user/1
```

#### Test with JWT (if JWT filter is enabled)

```bash
# First, get a JWT token from your auth service
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### React Frontend Example

```javascript
// services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  getAllUsers: () => api.get("/users"),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (user) => api.post("/users", user),
  updateUser: (id, user) => api.put(`/users/${id}`, user),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const orderService = {
  getAllOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getOrdersByUserId: (userId) => api.get(`/orders/user/${userId}`),
  createOrder: (order) => api.post("/orders", order),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};
```

```javascript
// Example React Component
import React, { useEffect, useState } from "react";
import { userService } from "./services/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getAllUsers()
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users</h1>
      {users.map((user) => (
        <div key={user.id}>
          <p>
            {user.name} - {user.email}
          </p>
        </div>
      ))}
    </div>
  );
}

export default UserList;
```

---

## PART 6 – BEST PRACTICES

### Port Assignment Strategy

| Service         | Port | Environment Variable      |
| --------------- | ---- | ------------------------- |
| Eureka Server   | 8761 | Fixed (industry standard) |
| API Gateway     | 8080 | `SERVER_PORT=8080`        |
| User Service    | 8081 | `SERVER_PORT=8081`        |
| Order Service   | 8082 | `SERVER_PORT=8082`        |
| Billing Service | 8083 | `SERVER_PORT=8083`        |

**For Production:**

- Use environment variables for all ports
- Use random ports with `server.port=0` and let Eureka track them
- Use DNS names instead of `localhost`

### Avoid Hardcoding URLs

❌ **Bad Practice:**

```java
String userServiceUrl = "http://localhost:8081/users";
```

✅ **Good Practice:**

```java
@Autowired
private DiscoveryClient discoveryClient;

public String getUserServiceUrl() {
    List<ServiceInstance> instances = discoveryClient.getInstances("USER-SERVICE");
    if (!instances.isEmpty()) {
        return instances.get(0).getUri().toString();
    }
    throw new RuntimeException("USER-SERVICE not available");
}
```

✅ **Better Practice (using RestTemplate with Load Balancing):**

```java
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}

@Autowired
private RestTemplate restTemplate;

public User getUser(Long id) {
    return restTemplate.getForObject(
        "http://USER-SERVICE/users/" + id,
        User.class
    );
}
```

### Prepare for Scaling

#### 1. Database Per Service Pattern

- Each microservice has its own database
- Never share databases between services
- Use API calls for inter-service communication

#### 2. Externalize Configuration

Use Spring Cloud Config Server:

```yaml
spring:
  cloud:
    config:
      uri: http://localhost:8888
```

#### 3. Health Checks

Always implement actuator health endpoints:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
```

#### 4. Circuit Breaker (Resilience4j)

Add dependency:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

Example:

```java
@CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
public User getUser(Long id) {
    return restTemplate.getForObject("http://USER-SERVICE/users/" + id, User.class);
}

public User getUserFallback(Long id, Exception e) {
    return new User(id, "Default User", "default@example.com", "000");
}
```

#### 5. Distributed Tracing

Add Micrometer Tracing:

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

### Common Mistakes

| Mistake                                   | Impact                        | Solution                                  |
| ----------------------------------------- | ----------------------------- | ----------------------------------------- |
| **Starting services before Eureka**       | Services can't register       | Always start Eureka first                 |
| **Hardcoded service URLs**                | Can't scale or move services  | Use service discovery names               |
| **Not using `lb://` prefix**              | No load balancing             | Always use `lb://SERVICE-NAME` in Gateway |
| **Same database for all services**        | Tight coupling                | One database per service                  |
| **No health checks**                      | Can't detect failures         | Implement Actuator health endpoints       |
| **Not handling service failures**         | Cascading failures            | Use Circuit Breaker pattern               |
| **Exposing microservices directly**       | Security risk, tight coupling | Always route through Gateway              |
| **Not setting `prefer-ip-address: true`** | DNS issues in local env       | Set in Eureka client config               |
| **Forgetting CORS in Gateway**            | Frontend can't call API       | Configure global CORS                     |
| **Not validating JWT at Gateway**         | Security vulnerability        | Centralize auth at Gateway level          |

### Production Checklist

- [ ] Replace hardcoded secrets with environment variables
- [ ] Enable HTTPS/TLS
- [ ] Set up centralized logging (ELK stack)
- [ ] Implement distributed tracing (Zipkin/Jaeger)
- [ ] Add rate limiting
- [ ] Configure proper CORS origins
- [ ] Set up database connection pooling
- [ ] Enable Spring Boot Actuator security
- [ ] Implement proper exception handling
- [ ] Add request/response logging
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure proper JVM settings
- [ ] Implement database migrations (Flyway/Liquibase)
- [ ] Add API documentation (SpringDoc OpenAPI)
- [ ] Set up CI/CD pipeline

---

## Quick Start Commands

```bash
# 1. Start Eureka
cd backend-services/eureka-server && mvn spring-boot:run

# 2. Start Gateway (in new terminal)
cd backend-services/api-gateway && mvn spring-boot:run

# 3. Start User Service (in new terminal)
cd backend-services/user-service && mvn spring-boot:run

# 4. Start Order Service (in new terminal)
cd backend-services/order-service && mvn spring-boot:run

# 5. Verify all services registered
open http://localhost:8761

# 6. Test via Gateway
curl http://localhost:8080/api/users
```

---

## Monitoring URLs

- **Eureka Dashboard**: http://localhost:8761
- **Gateway Actuator**: http://localhost:8080/actuator
- **User Service Health**: http://localhost:8081/actuator/health
- **Order Service Health**: http://localhost:8082/actuator/health
- **Gateway Routes**: http://localhost:8080/actuator/gateway/routes

---

**Version**: Spring Boot 3.2.2, Spring Cloud 2023.0.0, Java 21  
**Last Updated**: 2026-02-11
