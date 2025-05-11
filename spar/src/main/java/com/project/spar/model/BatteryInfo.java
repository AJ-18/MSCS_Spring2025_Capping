package com.project.spar.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
@Entity @Table(name="battery_info")
public class BatteryInfo {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private boolean hasBattery;
    private int batteryPercentage;
    @JsonProperty("isCharging")
    private boolean isCharging;
    private Double powerConsumption;
    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne @JoinColumn(name="device_spec_id", nullable=false)
    private DeviceSpecification device;
}
