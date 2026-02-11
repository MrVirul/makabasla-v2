package com.makabas.webstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class WebstoreServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebstoreServiceApplication.class, args);
    }
}
