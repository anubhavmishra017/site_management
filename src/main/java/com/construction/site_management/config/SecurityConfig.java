package com.construction.site_management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable()) // disable CSRF for API
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // allow all requests without login
            )
            .formLogin(login -> login.disable()) // disable default login page
            .httpBasic(basic -> basic.disable()); // disable browser auth popup

        return http.build();
    }
}
