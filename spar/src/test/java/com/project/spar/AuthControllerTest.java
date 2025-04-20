package com.project.spar;

import com.project.spar.model.User;
import com.project.spar.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.test.context.ActiveProfiles;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@Transactional
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepo;
    @Autowired PasswordEncoder encoder;

    @BeforeEach
    void setUp() {
        userRepo.deleteAll();
    }

    @Test
    void signupThenSignin() throws Exception {
        // 1) Sign up
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "username": "alice",
                      "password": "pass123",
                      "email": "alice@example.com"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(content().string("User registered successfully!"));

        // Verify user persisted
        User saved = userRepo.findByUsername("alice").orElseThrow();
        assert encoder.matches("pass123", saved.getPassword());

        // 2) Sign in
        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "username": "alice",
                      "password": "pass123"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());
    }
}

