package com.flowdesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 FlowDesk Java Spring Boot Enterprise Backend Started!");
        System.out.println("=================================================");
    }
}
