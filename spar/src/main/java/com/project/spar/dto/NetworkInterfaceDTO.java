package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NetworkInterfaceDTO {
    private Long   id;
    private String iface;
    private String ipAddress;
    private String macAddress;
    private double speedMbps;
    private Long   userId;
    private String deviceId;
    private LocalDateTime timestamp;
}
