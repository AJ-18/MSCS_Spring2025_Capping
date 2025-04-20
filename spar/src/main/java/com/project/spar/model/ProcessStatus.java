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
@Table(name = "process_status")
public class ProcessStatus {
    private String userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Process ID and name
    private int pid;
    private String name;

    // CPU usage (percentage) and memory consumption (in MB)
    private double cpuUsage;
    private double memoryMB;

    private LocalDateTime timestamp = LocalDateTime.now();
}
