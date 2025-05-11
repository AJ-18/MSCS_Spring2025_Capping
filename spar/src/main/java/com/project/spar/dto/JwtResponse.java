package com.project.spar.dto;

import lombok.Data;

/**
 * Response body containing JWT token and user ID.
 */
@Data
public class JwtResponse {
    private String token;
    private Long userId;

    public JwtResponse(String token, Long userId) {
        this.token = token;
        this.userId = userId;
    }
}
