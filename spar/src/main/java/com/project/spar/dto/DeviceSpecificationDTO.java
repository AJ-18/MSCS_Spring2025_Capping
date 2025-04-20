package com.project.spar.dto;

import java.time.LocalDateTime;

public record DeviceSpecificationDTO(
        Long id,
        String deviceId,
        String deviceName,
        String manufacturer,
        String model,
        String processor,
        int cpuPhysicalCores,
        int cpuLogicalCores,
        double installedRam,
        String graphics,
        String operatingSystem,
        String systemType,
        LocalDateTime registeredAt
) {}
