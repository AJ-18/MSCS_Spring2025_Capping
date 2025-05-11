package com.project.spar.controller;

import com.project.spar.constants.AppConstants;
import com.project.spar.dto.DeviceSpecificationDTO;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.service.UserDeviceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserDeviceService userDeviceService;

    @PostMapping("/{userId}/devices")
    public ResponseEntity<List<DeviceSpecificationDTO>> addOrGetDevices(
            @PathVariable Long userId,
            @RequestBody DeviceSpecification payload
    ) {
        logger.info("addOrGetDevices called for userId={}", userId);
        try {
            List<DeviceSpecificationDTO> dtos = userDeviceService.addOrGetDevices(userId, payload);
            logger.info("addOrGetDevices successful for userId={}; count={}", userId, dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (ResponseStatusException e) {
            logger.warn("addOrGetDevices failed for userId={}: {}", userId, e.getReason());
            throw e;
        } catch (Exception e) {
            logger.error("Error in addOrGetDevices for userId={}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }

    @GetMapping("/{userId}/getdevices")
    public ResponseEntity<List<DeviceSpecificationDTO>> getDevices(
            @PathVariable Long userId
    ) {
        logger.info("getDevices called for userId={}", userId);
        try {
            List<DeviceSpecificationDTO> dtos = userDeviceService.getDevices(userId);
            logger.info("getDevices successful for userId={}; count={}", userId, dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (ResponseStatusException e) {
            logger.warn("getDevices failed for userId={}: {}", userId, e.getReason());
            throw e;
        } catch (Exception e) {
            logger.error("Error in getDevices for userId={}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }
}
