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
@Table(name = "network_interfaces")
public class NetworkInterface {
    private String userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Interface name, IP address, MAC address, and link speed in Mbps
    private String interfaceName;
    private String ipAddress;
    private String macAddress;
    private double speedMbps;

    private LocalDateTime timestamp = LocalDateTime.now();
}
