package com.lms.config;

import com.lms.auth.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;

    @Value("${cors.allowed-origins}")
    private String corsAllowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, RateLimitFilter rateLimitFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rateLimitFilter = rateLimitFilter;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                // Permite que el iframe en la misma página cargue el contenido del stream
                // (PDF/video). DENY bloquea cualquier iframe; SAMEORIGIN lo permite
                // solo si el padre y el iframe están en el mismo origen.
                .frameOptions(frame -> frame.sameOrigin())
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/payments/webhook").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses", "/api/courses/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses/categories", "/api/courses/tags").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lessons/*", "/api/lessons/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/assessments/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/assessments/*/submissions/*").permitAll() // Permitir POST a submissions sin autenticación
                .requestMatchers(HttpMethod.GET, "/api/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/features").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/courses/*/reviews", "/api/courses/*/rating").permitAll()
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/tutor/**").authenticated()
                .requestMatchers("/api/gamification/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/gamification/leaderboard").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/gamification/stats/*").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
