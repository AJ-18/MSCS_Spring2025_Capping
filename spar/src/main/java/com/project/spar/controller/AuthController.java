// src/main/java/com/project/spar/controller/AuthController.java
package com.project.spar.controller;

import com.project.spar.constants.AppConstants;
import com.project.spar.dto.JwtResponse;
import com.project.spar.dto.LoginRequest;
import com.project.spar.dto.SignupRequest;
import com.project.spar.model.Token;
import com.project.spar.model.User;
import com.project.spar.repository.TokenRepository;
import com.project.spar.repository.UserRepository;
import com.project.spar.security.JwtUtils;
import com.project.spar.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.project.spar.service.TokenService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserRepository userRepo;
    @Autowired private TokenRepository tokenRepo;
    @Autowired private PasswordEncoder encoder;
    @Autowired private TokenService tokenService;

    /**
     * Endpoint for user registration.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        logger.info("Signup requested for username: {}", req.getUsername());

        // Check if username is already taken
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            logger.warn("Signup failed - Username '{}' already taken", req.getUsername());
            return ResponseEntity.badRequest().body(AppConstants.ERROR_USERNAME_ALREADY_TAKEN);
        }

        // Check if email is already registered
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            logger.warn("Signup failed - Email '{}' already used", req.getEmail());
            return ResponseEntity.badRequest().body(AppConstants.ERROR_EMAIL_ALREADY_USED);
        }

        // Create new user and save to DB
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        userRepo.save(user);

        logger.info("User '{}' registered successfully", req.getUsername());
        return ResponseEntity.ok(AppConstants.USER_REGISTERED_SUCCESSFULLY);
    }

    /**
     * Endpoint for user login.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody LoginRequest req) {
        logger.info("Signin attempt for username: {}", req.getUsername());

        try {
            // Authenticate user credentials
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );

            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            String token = tokenService.createTokenForUser(userDetails.getUsername());

            logger.info("User '{}' signed in successfully", req.getUsername());
            return ResponseEntity.ok(new JwtResponse(token, userDetails.getId()));
        } catch (BadCredentialsException ex) {
            logger.warn("Signin failed - Invalid credentials for username: {}", req.getUsername());
            return ResponseEntity.status(401).body("Invalid username or password");
        } catch (Exception ex) {
            logger.error("Signin error for username {}: {}", req.getUsername(), ex.getMessage());
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    /**
     * Endpoint for user logout.
     */
    @PostMapping("/signout")
    public ResponseEntity<?> signout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String jti = jwtUtils.getJtiFromToken(token);
            tokenService.revokeToken(jti);
            logger.info("Token with jti '{}' revoked successfully", jti);
        } else {
            logger.warn("Signout failed - Authorization header missing or malformed");
        }

        return ResponseEntity.ok("Signed out");
    }
}
