package com.project.spar.service;

import com.project.spar.model.Token;
import com.project.spar.repository.TokenRepository;
import com.project.spar.security.JwtUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class TokenService {
    private final TokenRepository tokenRepo;
    private final JwtUtils jwtUtils;

    public TokenService(TokenRepository tokenRepo, JwtUtils jwtUtils) {
        this.tokenRepo = tokenRepo;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Generate a new JWT for the given username, extract its JTI,
     * persist it, and return the raw token string.
     */
    @Transactional
    public String createTokenForUser(String username) {
        // 1) generate JWT
        String token = jwtUtils.generateToken(username);

        // 2) pull out the JTI and compute issued/expires
        String jti = jwtUtils.getJtiFromToken(token);
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusMillis(jwtUtils.getExpirationMs());

        // 3) save a record of it
        Token t = new Token();
        t.setUsername(username);
        t.setJti(jti);
        t.setIssuedAt(issuedAt);
        t.setExpiresAt(expiresAt);
        tokenRepo.save(t);

        return token;
    }

    /**
     * Returns true if we have an unexpired Token record for that jti.
     */
    @Transactional(readOnly = true)
    public boolean isJtiValid(String jti) {
        return tokenRepo.findByJti(jti)
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .isPresent();
    }

    /**
     * Revoke (delete) a single token by its JTI.
     */
    @Transactional
    public void revokeToken(String jti) {
        tokenRepo.deleteByJti(jti);
    }

    /**
     * Revoke all tokens belonging to a given user (e.g. logout-all).
     */
    @Transactional
    public void revokeAllTokensForUser(String username) {
        tokenRepo.deleteByUsername(username);
    }

    /**
     * Fetch all tokens for a user (if you ever need them).
     */
    @Transactional(readOnly = true)
    public List<Token> getTokensForUser(String username) {
        return tokenRepo.findByUsername(username);
    }

    public boolean isTokenPresent(String jti) {
        return tokenRepo.existsByJti(jti);
    }

}
