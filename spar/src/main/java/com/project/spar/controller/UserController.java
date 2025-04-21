package com.project.spar.controller;

import com.project.spar.dto.DeviceSpecificationDTO;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.service.UserDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserDeviceService userDeviceService;

    @PostMapping("/{userId}/devices")
    public ResponseEntity<List<DeviceSpecificationDTO>> addOrGetDevices(
            @PathVariable Long userId,
            @RequestBody DeviceSpecification payload
    ) {
        List<DeviceSpecificationDTO> dtos =
                userDeviceService.addOrGetDevices(userId, payload);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{userId}/getdevices")
    public ResponseEntity<List<DeviceSpecificationDTO>> getDevices(
            @PathVariable Long userId
    ) {
        List<DeviceSpecificationDTO> dtos =
                userDeviceService.getDevices(userId);
        return ResponseEntity.ok(dtos);
    }


}
