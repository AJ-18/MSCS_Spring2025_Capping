// src/main/java/com/project/spar/controller/AuthController.java
package com.project.spar.controller;

import com.project.spar.model.User;
import com.project.spar.repository.UserRepository;
import com.project.spar.security.JwtUtils;
import com.project.spar.security.UserDetailsImpl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired AuthenticationManager authManager;
    @Autowired JwtUtils jwtUtils;
    @Autowired UserRepository userRepo;
    @Autowired PasswordEncoder encoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        userRepo.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getUsername(),
                        req.getPassword()
                )
        );
        // Our UserDetailsImpl has the user’s ID
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        Long userId = userDetails.getId();

        String token = jwtUtils.generateToken(req.getUsername());
        return ResponseEntity.ok(new JwtResponse(token, userId));
    }

    @Data
    static class SignupRequest {
        @NotBlank
        private String username;
        @NotBlank private String password;
        @NotBlank @Email
        private String email;    // NEW
    }

    @Data
    static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data
    static class JwtResponse {
        private String token;
        private Long userId;

        public JwtResponse(String token, Long userId) {
            this.token = token;
            this.userId = userId;
        }
        // getters & setters...
    }

}
