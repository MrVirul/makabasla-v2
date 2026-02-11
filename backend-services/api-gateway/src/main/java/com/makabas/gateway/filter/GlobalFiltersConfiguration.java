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
