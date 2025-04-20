package com.project.spar.dto;

import java.time.LocalDateTime;

public record CpuUsageDTO(
        Long id,
        double totalCpuLoad,
        String perCoreUsageJson,
        Long userId,
        String deviceId,
        LocalDateTime timestamp
) {}
