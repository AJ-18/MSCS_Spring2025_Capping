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
@Table(name = "memory_usage")
public class RamUsage {
    private String userId;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double totalMemory;
    private double usedMemory;
    private double availableMemory;

    private LocalDateTime timestamp = LocalDateTime.now();

}
