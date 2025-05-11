// src/test/java/com/project/spar/MetricsControllerTest.java
package com.project.spar;

import com.project.spar.model.DeviceSpecification;
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

import java.util.UUID;

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
class MetricsControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepo;
    @Autowired DeviceSpecificationRepository deviceRepo;
    @Autowired PasswordEncoder encoder;

    private Long userId;
    private String jwt;
    private String deviceId;

    @BeforeEach
    void setUp() throws Exception {
        // clean out
        deviceRepo.deleteAll();
        userRepo.deleteAll();

        // 1) create user
        User user = new User();
        user.setUsername("charlie");
        user.setPassword(encoder.encode("password"));
        user.setEmail("charlie@example.com");
        userRepo.save(user);
        userId = user.getId();

        // 2) sign in -> JWT
        var signIn = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                  {
                    "username":"charlie",
                    "password":"password"
                  }
                  """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        jwt = com.fasterxml.jackson.databind.json.JsonMapper
                .builder().build()
                .readTree(signIn.getResponse().getContentAsString())
                .get("token").asText();

        // 3) register a device for metrics
        deviceId = UUID.randomUUID().toString();
        mockMvc.perform(post("/api/users/" + userId + "/devices")
                        .header("Authorization","Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                  {
                    "deviceId":"%s",
                    "deviceName":"Test Device",
                    "manufacturer":"Acme",
                    "model":"X1000",
                    "processor":"Acme CPU",
                    "cpuPhysicalCores":2,
                    "cpuLogicalCores":4,
                    "installedRam":8.0,
                    "graphics":"Integrated",
                    "operatingSystem":"TestOS 1.0",
                    "systemType":"x64",
                    "user":{"id":%d}
                  }
                  """.formatted(deviceId, userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].deviceId").value(deviceId));
    }

    @Test
    void postBatteryInfo() throws Exception {
        mockMvc.perform(post("/api/metrics/battery-info")
                        .header("Authorization","Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                  {
                    "hasBattery": true,
                    "batteryPercentage": 75,
                    "isCharging": false,
                    "powerConsumption": 3.5,
                    "user": {"id": %d},
                    "device": {"deviceId": "%s"}
                  }
                  """.formatted(userId, deviceId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.batteryPercentage").value(75))
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.deviceId").value(deviceId));
    }

    @Test
    void postCpuUsage() throws Exception {
        mockMvc.perform(post("/api/metrics/cpu-usage")
                        .header("Authorization","Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                  {
                    "totalCpuLoad": 55.5,
                    "perCoreUsageJson": "[{\\"core\\":1,\\"usage\\":50.0}]",
                    "user": {"id": %d},
                    "device": {"deviceId": "%s"}
                  }
                  """.formatted(userId, deviceId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCpuLoad").value(55.5))
                .andExpect(jsonPath("$.perCoreUsageJson").isString())
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.deviceId").value(deviceId));
    }

    @Test
    void postRamUsage() throws Exception {
        mockMvc.perform(post("/api/metrics/ram-usage")
                        .header("Authorization","Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                  {
                    "totalMemory": 16.0,
                    "usedMemory": 8.2,
                    "availableMemory": 7.8,
                    "user": {"id": %d},
                    "device": {"deviceId": "%s"}
                  }
                  """.formatted(userId, deviceId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usedMemory").value(8.2))
                .andExpect(jsonPath("$.availableMemory").value(7.8))
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.deviceId").value(deviceId));
    }
}
