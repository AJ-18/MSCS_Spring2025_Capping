// src/main/java/com/project/spar/repository/UserRepository.java
package com.project.spar.repository;

import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);   // NEW
}
