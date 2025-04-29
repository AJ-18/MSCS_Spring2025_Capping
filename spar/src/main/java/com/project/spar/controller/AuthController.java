package com.project.spar.controller;

import com.project.spar.constants.AppConstants;
import com.project.spar.model.User;
import com.project.spar.repository.UserRepository;
import com.project.spar.security.JwtUtils;
import com.project.spar.security.UserDetailsImpl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        logger.info("Signup requested");
        try {
            if (userRepo.findByUsername(req.getUsername()).isPresent()) {
                logger.warn("Signup failed: username already taken");
                return ResponseEntity
                        .badRequest()
                        .body(AppConstants.ERROR_USERNAME_ALREADY_TAKEN);
            }
            if (userRepo.findByEmail(req.getEmail()).isPresent()) {
                logger.warn("Signup failed: email already used");
                return ResponseEntity
                        .badRequest()
                        .body(AppConstants.ERROR_EMAIL_ALREADY_USED);
            }
            User user = new User();
            user.setUsername(req.getUsername());
            user.setPassword(encoder.encode(req.getPassword()));
            user.setEmail(req.getEmail());
            userRepo.save(user);
            logger.info("Signup successful");
            return ResponseEntity.ok(AppConstants.USER_REGISTERED_SUCCESSFULLY);
        } catch (Exception e) {
            logger.error("Error during signup", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AppConstants.ERROR_GENERIC);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody LoginRequest req) {
        logger.info("Signin requested");
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getUsername(),
                            req.getPassword()
                    )
            );
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            Long userId = userDetails.getId();

            String token = jwtUtils.generateToken(userDetails.getUsername());
            logger.info("Signin successful");
            return ResponseEntity.ok(new JwtResponse(token, userId));
        } catch (BadCredentialsException e) {
            logger.warn("Signin failed: invalid credentials");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(AppConstants.ERROR_INVALID_CREDENTIALS);
        } catch (Exception e) {
            logger.error("Error during signin", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AppConstants.ERROR_GENERIC);
        }
    }

    @Data
    static class SignupRequest {
        @NotBlank private String username;
        @NotBlank private String password;
        @NotBlank @Email private String email;
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
    }
}
