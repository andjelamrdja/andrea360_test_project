package com.andrea360.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.awt.*;
import java.net.URI;

@SpringBootApplication
public class Andrea360BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(Andrea360BackendApplication.class, args);
    }
}
