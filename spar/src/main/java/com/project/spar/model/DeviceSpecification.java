package com.project.spar.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
@Entity @Table(name="device_specifications")
public class DeviceSpecification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true) private String deviceId;
    private String deviceName;
    private String manufacturer;
    private String model;
    private String processor;
    private int cpuPhysicalCores;
    private int cpuLogicalCores;
    private double installedRam; // in GB
    private String graphics;
    private String operatingSystem;
    private String systemType;
    private LocalDateTime registeredAt = LocalDateTime.now();

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private User user;
}