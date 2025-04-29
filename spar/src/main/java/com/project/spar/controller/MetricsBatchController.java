package com.project.spar.controller;

import com.project.spar.dto.MetricsBatchDTO;
import com.project.spar.service.MetricsBatchService;
import com.project.spar.constants.AppConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsBatchController {

    private static final Logger logger = LoggerFactory.getLogger(MetricsBatchController.class);

    @Autowired
    private MetricsBatchService metricsBatchService;

    @PostMapping("/batch")
    public ResponseEntity<String> publishBatch(@RequestBody MetricsBatchDTO batch) {
        logger.info("publishBatch requested");
        try {
            String output = metricsBatchService.addMetrics(batch);
            logger.info("publishBatch successful");
            return ResponseEntity.accepted().body(output);  // HTTP 202
        } catch (Exception e) {
            logger.error("Error during publishBatch", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AppConstants.ERROR_GENERIC);
        }
    }
}
