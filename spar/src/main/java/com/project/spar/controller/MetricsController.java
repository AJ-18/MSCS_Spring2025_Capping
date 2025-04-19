package com.project.spar.controller;


import com.project.spar.model.*;
import com.project.spar.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin("/*")
@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    @Autowired
    private MetricsService metricsService;

    @PostMapping("/device-specifications")
    public ResponseEntity<?> receiveDeviceSpecification(@RequestBody DeviceSpecification deviceSpec) {
        try {
            DeviceSpecification saved = metricsService.saveDeviceSpecification(deviceSpec);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving device specification: " + e.getMessage());
        }
    }

    @PostMapping("/cpu-usage")
    public ResponseEntity<?> receiveCpuUsage(@RequestBody CpuUsage cpuUsage) {
        try {
            CpuUsage saved = metricsService.saveCpuUsage(cpuUsage);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving CPU usage: " + e.getMessage());
        }
    }

    @PostMapping("/memory-usage")
    public ResponseEntity<?> receiveMemoryUsage(@RequestBody RamUsage ramUsage) {
        try {
            RamUsage saved = metricsService.saveMemoryUsage(ramUsage);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving memory usage: " + e.getMessage());
        }
    }

    @PostMapping("/disk-usage")
    public ResponseEntity<?> receiveDiskUsage(@RequestBody List<DiskUsage> diskUsages) {
        try {
            List<DiskUsage> savedList = diskUsages.stream()
                    .map(metricsService::saveDiskUsage)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(savedList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving disk usage: " + e.getMessage());
        }
    }

    @PostMapping("/disk-io")
    public ResponseEntity<?> receiveDiskIO(@RequestBody DiskIO diskIO) {
        try {
            DiskIO saved = metricsService.saveDiskIO(diskIO);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving disk IO: " + e.getMessage());
        }
    }

    @PostMapping("/process-status")
    public ResponseEntity<?> receiveProcessStatus(@RequestBody List<ProcessStatus> processStatuses) {
        try {
            List<ProcessStatus> saved = processStatuses.stream()
                    .map(metricsService::saveProcessStatus)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving process status: " + e.getMessage());
        }
    }

    @PostMapping("/network-interfaces")
    public ResponseEntity<?> receiveNetworkInterface(@RequestBody List<NetworkInterface> networkInterfaces) {
        try {
            List<NetworkInterface> saved = networkInterfaces.stream()
                    .map(metricsService::saveNetworkInterface)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving network interface: " + e.getMessage());
        }
    }

    @PostMapping("/battery-info")
    public ResponseEntity<?> receiveBatteryInfo(@RequestBody BatteryInfo batteryInfo) {
        try {
            BatteryInfo saved = metricsService.saveBatteryInfo(batteryInfo);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving battery info: " + e.getMessage());
        }
    }
}

