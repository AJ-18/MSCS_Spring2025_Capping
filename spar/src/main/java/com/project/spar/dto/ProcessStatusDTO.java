package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessStatusDTO {
    private Long   id;
    private long   pid;
    private String name;
    private double cpuUsage;
    private double memoryMB;
    private Long   userId;
    private String deviceId;
    private LocalDateTime timestamp;
}
