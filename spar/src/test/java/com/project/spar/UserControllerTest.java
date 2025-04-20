package com.project.spar;

import com.project.spar.model.User;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
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
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepo;
    @Autowired DeviceSpecificationRepository deviceRepo;
    @Autowired PasswordEncoder encoder;

    private Long userId;
    private String jwt;

    @BeforeEach
    void init() throws Exception {
        deviceRepo.deleteAll();
        userRepo.deleteAll();

        // Create user
        User u = new User();
        u.setUsername("bob");
        u.setPassword(encoder.encode("secret"));
        u.setEmail("bob@example.com");
        userRepo.save(u);
        userId = u.getId();

        // Sign in to get JWT
        var mvcResult = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "username": "bob",
                      "password": "secret"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        String body = mvcResult.getResponse().getContentAsString();
        jwt = com.fasterxml.jackson.databind.json.JsonMapper
                .builder().build()
                .readTree(body).get("token").asText();
    }

    @Test
    void postDevices_createsAndReturnsList() throws Exception {
        mockMvc.perform(post("/api/users/" + userId + "/devices")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "deviceName": "Lenovo",
                      "manufacturer": "Dell",
                      "model": "Inspiron 15",
                      "processor": "Intel Core i7 2.8 GHz",
                      "cpuPhysicalCores": 10,
                      "cpuLogicalCores": 8,
                      "installedRam": 16.0,
                      "graphics": "NVIDIA GTX 1650",
                      "operatingSystem": "Windows 10 x64",
                      "systemType": "x64 operating system, x64-based processor",
                      "user": { "id": %d }
                    }
                    """.formatted(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].deviceName").value("Lenovo"))
                .andExpect(jsonPath("$[0].manufacturer").value("Dell"))
                .andExpect(jsonPath("$[0].deviceId").isNotEmpty());
    }
}
