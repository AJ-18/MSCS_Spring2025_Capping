// src/main/java/com/project/spar/controller/AuthController.java
package com.project.spar.controller;

import com.project.spar.constants.AppConstants;
import com.project.spar.model.Token;
import com.project.spar.model.User;
import com.project.spar.repository.TokenRepository;
import com.project.spar.repository.UserRepository;
import com.project.spar.security.JwtUtils;
import com.project.spar.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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

import java.time.Instant;

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

    @Autowired private  TokenService tokenService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        logger.info("Signup requested");
        if (userRepo.findByUsername(req.getUsername()).isPresent())
            return ResponseEntity.badRequest().body(AppConstants.ERROR_USERNAME_ALREADY_TAKEN);
        if (userRepo.findByEmail(req.getEmail()).isPresent())
            return ResponseEntity.badRequest().body(AppConstants.ERROR_EMAIL_ALREADY_USED);

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        userRepo.save(user);
        return ResponseEntity.ok(AppConstants.USER_REGISTERED_SUCCESSFULLY);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        // delegate everything to TokenService
        String token = tokenService.createTokenForUser(userDetails.getUsername());

        return ResponseEntity.ok(new JwtResponse(token, userDetails.getId()));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String jti = jwtUtils.getJtiFromToken(token);
            tokenService.revokeToken(jti);
        }
        return ResponseEntity.ok("Signed out");
    }

    @Data static class SignupRequest {
        @NotBlank private String username;
        @NotBlank private String password;
        @NotBlank @Email private String email;
    }
    @Data static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }
    @Data static class JwtResponse {
        private String token;
        private Long userId;
        public JwtResponse(String token, Long userId) {
            this.token = token; this.userId = userId;
        }
    }


}
