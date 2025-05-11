package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiskIODTO {
    private Long   id;
    private double readSpeedMBps;
    private double writeSpeedMBps;
    private Long   userId;
    private String deviceId;
    private LocalDateTime timestamp;
}
