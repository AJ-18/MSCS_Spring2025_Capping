package com.project.spar.dto;

import java.time.LocalDateTime;

public record BatteryInfoDTO(
        Long id,
        boolean hasBattery,
        int batteryPercentage,
        boolean isCharging,
        Double powerConsumption,
        Long userId,
        String deviceId,
        LocalDateTime timestamp
) {}
