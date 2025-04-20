package com.project.spar.dto;

import java.time.LocalDateTime;

public record DiskIODTO(
        Long id,
        double readSpeedMBps,
        double writeSpeedMBps,
        Long userId,
        String deviceId,
        LocalDateTime timestamp
) {}
