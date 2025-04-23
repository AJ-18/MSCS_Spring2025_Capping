package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceSpecificationDTO {
    private Long   id;
    private String deviceId;
    private String deviceName;
    private String manufacturer;
    private String model;
    private String processor;
    private int    cpuPhysicalCores;
    private int    cpuLogicalCores;
    private double installedRam;
    private String graphics;
    private String operatingSystem;
    private String systemType;
    private LocalDateTime registeredAt;
}
