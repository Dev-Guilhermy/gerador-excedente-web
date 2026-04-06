package com.geradorexcedente.security;

import java.util.List; // IMPORT NECESSÁRIO

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class CorsConfig {

        @Bean
        CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration config = new CorsConfiguration();

                // // =========== EM DESENVOLVIMENTO ===========
                // config.setAllowedOriginPatterns(List.of(
                // "http://localhost:*",
                // "http://127.0.0.1:*"));

                // =========== EM PRODUÇÂO ===========
                config.setAllowedOrigins(List.of(
                                "https://gerador-excedente.netlify.app"));

                config.setAllowedMethods(List.of(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "OPTIONS"));

                config.setAllowedHeaders(List.of("*"));

                config.setExposedHeaders(List.of("Authorization"));

                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", config);

                return source;
        }
}