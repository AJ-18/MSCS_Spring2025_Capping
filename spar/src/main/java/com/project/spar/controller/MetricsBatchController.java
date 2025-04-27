package com.project.spar.controller;

import com.project.spar.dto.MetricsBatchDTO;
import com.project.spar.service.MetricsBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsBatchController {

    @Autowired
    MetricsBatchService metricsBatchService;

    @PostMapping("/batch")
    public ResponseEntity<String> publishBatch(@RequestBody MetricsBatchDTO batch) {
        String output = metricsBatchService.addMetrics(batch);
        return ResponseEntity.accepted().body(output);  // HTTP 202
    }
}
