package com.project.spar.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
@Entity @Table(name="ram_usage")
public class RamUsage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private double totalMemory;
    private double usedMemory;
    private double availableMemory;
    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @ManyToOne @JoinColumn(name="device_spec_id", nullable=false) private DeviceSpecification device;
}
