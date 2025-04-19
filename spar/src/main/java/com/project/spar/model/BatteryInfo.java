package com.project.spar.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "battery_info")
public class BatteryInfo {
    private String userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Indicates if a battery is present
    private boolean hasBattery;

    // Battery percentage and charging status
    private int batteryPercentage;
    private boolean isCharging;

    // Power consumption in watts (can be null if not available)
    private Double powerConsumption;

    private LocalDateTime timestamp = LocalDateTime.now();
}
