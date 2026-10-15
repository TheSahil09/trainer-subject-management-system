package com.nexanova.trainer_subject_app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {

        CorsConfiguration config = new CorsConfiguration();

        // ✅ Allow React frontend
        config.addAllowedOrigin("http://localhost:3000");

        // ✅ Allow headers (Content-Type, Authorization)
        config.addAllowedHeader("*");

        // ✅ Allow all HTTP methods
        config.addAllowedMethod("*");

        // ✅ Allow JWT / cookies
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // ✅ Apply CORS to all endpoints
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
