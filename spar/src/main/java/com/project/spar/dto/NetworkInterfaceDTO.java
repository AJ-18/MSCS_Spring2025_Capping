package com.project.spar.dto;

import java.time.LocalDateTime;

public record NetworkInterfaceDTO(
        Long id,
        String iface,
        String ipAddress,
        String macAddress,
        double speedMbps,
        Long userId,
        String deviceId,
        LocalDateTime timestamp
) {}
