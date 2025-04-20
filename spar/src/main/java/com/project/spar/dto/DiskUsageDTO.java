// src/main/java/com/project/spar/dto/DiskUsageDTO.java
package com.project.spar.dto;

import java.time.LocalDateTime;

public record DiskUsageDTO(
        Long id,
        String filesystem,
        double sizeGB,
        double usedGB,
        double availableGB,
        Long userId,
        String deviceId,
        LocalDateTime timestamp
) {}
