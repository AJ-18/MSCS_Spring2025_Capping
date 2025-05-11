package com.project.spar;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SparApplication {

	public static void main(String[] args) {
		SpringApplication.run(SparApplication.class, args);
	}
	@PostConstruct
	public void printPort() {
		System.out.println("PORT env: " + System.getenv("PORT"));
		System.out.println("server.port property: " + System.getProperty("server.port"));
	}
}
