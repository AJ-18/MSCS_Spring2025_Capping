package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RamUsageDTO {
    private Long   id;
    private double totalMemory;
    private double usedMemory;
    private double availableMemory;
    private Long   userId;
    private String deviceId;
    private LocalDateTime timestamp;
}
