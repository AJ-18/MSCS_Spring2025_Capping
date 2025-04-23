package com.project.spar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetricsBatchDTO {
    private Long  userId;
    private String deviceId;

    private BatteryInfoDTO       batteryInfo;
    private CpuUsageDTO          cpuUsage;
    private RamUsageDTO          ramUsage;
    private DiskIODTO            diskIO;
    private DiskUsageDTO         diskUsage;
    private List<NetworkInterfaceDTO> networkInterfaces;
    private List<ProcessStatusDTO>    processStatuses;
}
