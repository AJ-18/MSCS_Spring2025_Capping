package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatteryInfoDTO {
    private Long   id;
    private boolean hasBattery;
    private int    batteryPercentage;
    private boolean isCharging;
    private Double powerConsumption;
    private Long   userId;
    private String deviceId;
    private LocalDateTime timestamp;
}
