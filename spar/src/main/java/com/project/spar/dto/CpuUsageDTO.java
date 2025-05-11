package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CpuUsageDTO {
    private Long   id;
    private double totalCpuLoad;
    private String perCoreUsageJson;
    private Long   userId;
    private String deviceId;
    private LocalDateTime timestamp;
}
