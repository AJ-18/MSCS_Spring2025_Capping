package com.project.spar.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final AuthEntryPointJwt   unauthorizedHandler;
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthTokenFilter      authTokenFilter;

    public WebSecurityConfig(
            AuthEntryPointJwt unauthorizedHandler,
            UserDetailsServiceImpl userDetailsService,
            AuthTokenFilter authTokenFilter
    ) {
        this.unauthorizedHandler  = unauthorizedHandler;
        this.userDetailsService   = userDetailsService;
        this.authTokenFilter      = authTokenFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // wire in our CorsConfigurationSource bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // disable CSRF (JWT only)
                .csrf(csrf -> csrf.disable())

                // custom unauthorized handler
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))

                // stateless session (no HTTP session)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // authorization rules
                .authorizeHttpRequests(auth -> auth
                        // allow CORS preflight through
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // everything else requires authentication
                        .anyRequest().authenticated()
                )

                // add our JWT filter
                .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));  // or List.of("*")
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig
    ) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
