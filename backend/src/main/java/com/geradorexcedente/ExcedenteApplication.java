package com.geradorexcedente;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@EnableScheduling // 🔥 ATIVA O AGENDADOR
@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
public class ExcedenteApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExcedenteApplication.class, args);
    }
}