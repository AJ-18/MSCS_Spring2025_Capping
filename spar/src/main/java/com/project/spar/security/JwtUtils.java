// src/main/java/com/project/spar/security/JwtUtils.java
package com.project.spar.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtils {
    @Value("${jwt.secret}") private String jwtSecret;
    @Value("${jwt.expirationMs}") private Long jwtExpirationMs;

    /**
     * generate a token with a random jti
     */
    public String generateToken(String username) {
        Date now = new Date(), exp = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setId(UUID.randomUUID().toString())      // <-- jti
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS256, jwtSecret)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return parse(token).getBody().getSubject();
    }

    public String getJtiFromToken(String token) {
        return parse(token).getBody().getId();
    }

    public boolean validateToken(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token);
    }
}
