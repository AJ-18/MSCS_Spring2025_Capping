package com.project.spar.controller;

import com.project.spar.dto.MetricsBatchDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsBatchController {

    private static final String TOPIC = "spar-metrics-topic";

    @Autowired
    private KafkaTemplate<String, MetricsBatchDTO> kafkaTemplate;

    @PostMapping("/batch")
    public ResponseEntity<Void> publishBatch(@RequestBody MetricsBatchDTO batch) {
        kafkaTemplate.send(TOPIC, batch);
        return ResponseEntity.accepted().build();  // HTTP 202
    }
}
