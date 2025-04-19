package com.project.spar.controller;

import com.project.spar.model.BatteryInfo;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.ProcessStatus;
import com.project.spar.model.RamUsage;
import com.project.spar.service.MetricsQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsQueryController {

    @Autowired
    private MetricsQueryService queryService;

    /** GET all device specifications for a user */
    @GetMapping("/device-specifications/{userId}")
    public ResponseEntity<List<DeviceSpecification>> getDeviceSpecs(
            @PathVariable String userId) {
        List<DeviceSpecification> specs = queryService.getDeviceSpecs(userId);
        return ResponseEntity.ok(specs);
    }

    /** GET all process status entries for a user */
    @GetMapping("/process-status/{userId}")
    public ResponseEntity<List<ProcessStatus>> getProcessStatus(
            @PathVariable String userId) {
        return ResponseEntity.ok(queryService.getProcessStatus(userId));
    }

    /** GET all battery info entries for a user */
    @GetMapping("/battery-info/{userId}")
    public ResponseEntity<List<BatteryInfo>> getBatteryInfo(
            @PathVariable String userId) {
        return ResponseEntity.ok(queryService.getBatteryInfo(userId));
    }

    /** GET all memory usage entries for a user */
    @GetMapping("/memory-usage/{userId}")
    public ResponseEntity<List<RamUsage>> getMemoryUsage(
            @PathVariable String userId) {
        return ResponseEntity.ok(queryService.getRamUsage(userId));
    }
}
