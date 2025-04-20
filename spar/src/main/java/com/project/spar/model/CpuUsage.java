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
@Table(name = "cpu_usage")
public class CpuUsage {
    private String userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double totalCpuLoad;

    // Store per-core usage as a JSON string (e.g., [{"core":1,"usage":20.5}, ...])
    @Lob
    private String perCoreUsageJson;

    private LocalDateTime timestamp = LocalDateTime.now();
}
