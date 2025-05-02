package com.project.spar.repository;

import com.project.spar.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByJti(String jti);
    void deleteByJti(String jti);
    List<Token> findByUsername(String username);
    void deleteByUsername(String username);

    boolean existsByJti(String jti);
}
