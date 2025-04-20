package com.project.spar.dto;

import java.time.LocalDateTime;

public record RamUsageDTO(
        Long id,
        double totalMemory,
        double usedMemory,
        double availableMemory,
        Long userId,
        String deviceId,
        LocalDateTime timestamp
) {}
