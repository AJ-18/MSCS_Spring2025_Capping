package com.project.spar.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
@Entity @Table(name="disk_io")
public class DiskIO {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private double readSpeedMBps;
    private double writeSpeedMBps;
    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @ManyToOne @JoinColumn(name="device_spec_id", nullable=false) private DeviceSpecification device;
}
