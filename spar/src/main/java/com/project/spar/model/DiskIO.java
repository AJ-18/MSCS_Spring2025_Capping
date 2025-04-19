package com.project.spar.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "disk_io")
public class DiskIO {
    private String userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Read and write speeds in MB/s
    private double readSpeedMBps;
    private double writeSpeedMBps;

    private LocalDateTime timestamp = LocalDateTime.now();
}
