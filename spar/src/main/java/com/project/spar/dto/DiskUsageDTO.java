package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiskUsageDTO {
    private Long   id;
    private String filesystem;
    private double sizeGB;
    private double usedGB;
    private double availableGB;
    private Long   userId;
    private String deviceId;
    private LocalDateTime timestamp;
}
