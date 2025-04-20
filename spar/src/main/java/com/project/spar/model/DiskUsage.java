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
@Table(name = "disk_usage")
public class DiskUsage {
    private String userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Filesystem name (e.g., /dev/sda1)
    private String filesystem;
    // Size, used, and available space in GB
    private double sizeGB;
    private double usedGB;
    private double availableGB;

    // Timestamp for when the record is saved
    private LocalDateTime timestamp = LocalDateTime.now();
}
