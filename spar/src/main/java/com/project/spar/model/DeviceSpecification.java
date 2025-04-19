package com.project.spar.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@Entity
@Table(name = "device_specifications")
public class DeviceSpecification {
    private String userId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deviceId;


    private String deviceName;
    private String manufacturer;
    private String model;
    private String processor;
    private int cpuPhysicalCores;
    private int cpuLogicalCores;
    private double installedRam; // in GB
    private String graphics;
    private String operatingSystem;
    private String systemType;
    private LocalDateTime timestamp = LocalDateTime.now();
}
