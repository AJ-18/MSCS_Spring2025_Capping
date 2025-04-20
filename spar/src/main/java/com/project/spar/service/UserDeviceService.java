package com.project.spar.service;

import com.project.spar.dto.DeviceSpecificationDTO;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.User;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserDeviceService {

    @Autowired private UserRepository userRepo;
    @Autowired private DeviceSpecificationRepository deviceRepo;
    @Autowired private MetricsService metricsService;

    /**
     * Loads the User, checks for existing deviceName, creates one if needed,
     * persists via metricsService, then returns the full list of DTOs.
     */
    @Transactional
    public List<DeviceSpecificationDTO> addOrGetDevices(Long userId,
                                                        DeviceSpecification payload) {
        // 1) Load the user or 404
        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2) Check if device already exists
        String deviceName = payload.getDeviceName();
        boolean exists = deviceRepo
                .findByUserAndDeviceName(user, deviceName)
                .isPresent();

        // 3) Possibly generate deviceId, save new entity
        if (!exists) {
            String deviceId = payload.getDeviceId();
            if (deviceId == null || deviceId.isBlank()) {
                deviceId = UUID.randomUUID().toString();
            }

            DeviceSpecification ds = new DeviceSpecification();
            ds.setUser(user);
            ds.setDeviceId(deviceId);
            ds.setDeviceName(deviceName);
            ds.setManufacturer(payload.getManufacturer());
            ds.setModel(payload.getModel());
            ds.setProcessor(payload.getProcessor());
            ds.setCpuPhysicalCores(payload.getCpuPhysicalCores());
            ds.setCpuLogicalCores(payload.getCpuLogicalCores());
            ds.setInstalledRam(payload.getInstalledRam());
            ds.setGraphics(payload.getGraphics());
            ds.setOperatingSystem(payload.getOperatingSystem());
            ds.setSystemType(payload.getSystemType());
            user.getDevices().add(ds);
            metricsService.saveDeviceSpecification(ds);
        }

        // 4) Re-fetch & map to DTO
        List<DeviceSpecification> devices = deviceRepo.findAllByUser(user);
        return devices.stream()
                .map(ds -> new DeviceSpecificationDTO(
                        ds.getId(),
                        ds.getDeviceId(),
                        ds.getDeviceName(),
                        ds.getManufacturer(),
                        ds.getModel(),
                        ds.getProcessor(),
                        ds.getCpuPhysicalCores(),
                        ds.getCpuLogicalCores(),
                        ds.getInstalledRam(),
                        ds.getGraphics(),
                        ds.getOperatingSystem(),
                        ds.getSystemType(),
                        ds.getRegisteredAt()
                ))
                .collect(Collectors.toList());
    }
}
