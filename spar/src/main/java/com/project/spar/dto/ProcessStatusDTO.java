package com.project.spar.dto;

import java.time.LocalDateTime;

public record ProcessStatusDTO(
        Long id,
        long pid,
        String name,
        double cpuUsage,
        double memoryMB,
        Long userId,
        String deviceId,
        LocalDateTime timestamp
) {}
