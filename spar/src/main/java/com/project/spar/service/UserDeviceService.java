package com.project.spar.service;

import com.project.spar.constants.AppConstants;
import com.project.spar.dto.DeviceSpecificationDTO;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.User;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserDeviceService {

    private static final Logger logger = LoggerFactory.getLogger(UserDeviceService.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private DeviceSpecificationRepository deviceRepo;

    @Autowired
    private MetricsService metricsService;

    /**
     * Loads the User, checks for existing deviceName, creates one if needed,
     * persists via metricsService, then returns the full list of DTOs.
     */
    @Transactional
    public List<DeviceSpecificationDTO> addOrGetDevices(Long userId,
                                                        DeviceSpecification payload) {
        try {
            logger.info("addOrGetDevices called for userId={}", userId);

            // 1) Load the user or 404
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> {
                        logger.warn("User not found for userId={}", userId);
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.USER_NOT_FOUND);
                    });

            // 2) Check if device already exists
            String deviceName = payload.getDeviceName();
            boolean exists = deviceRepo.findByUserAndDeviceName(user, deviceName).isPresent();

            if (!exists) {
                // 3) Possibly generate deviceId, save new entity
                String deviceId = payload.getDeviceId();
                if (deviceId == null || deviceId.isBlank()) {
                    deviceId = UUID.randomUUID().toString();
                }
                logger.info("Creating new device for userId={}, deviceName={}", userId, deviceName);

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

                metricsService.saveDeviceSpecification(ds);
                logger.info("Device created with deviceId={} for userId={}", deviceId, userId);
            } else {
                logger.debug("Device already exists for userId={}, deviceName={}", userId, deviceName);
            }

            // 4) Re-fetch & map to DTO
            List<DeviceSpecification> devices = deviceRepo.findAllByUser(user);
            List<DeviceSpecificationDTO> dtos = devices.stream()
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

            logger.info("addOrGetDevices returning {} devices for userId={}", dtos.size(), userId);
            return dtos;

        } catch (ResponseStatusException rse) {
            // already logged above for 404
            throw rse;
        } catch (Exception e) {
            logger.error("Unexpected error in addOrGetDevices for userId={}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.GENERIC_ERROR);
        }
    }

    @Transactional
    public List<DeviceSpecificationDTO> getDevices(Long userId) {
        try {
            logger.info("getDevices called for userId={}", userId);

            List<DeviceSpecification> devices = deviceRepo.findAllByUserId(userId);
            List<DeviceSpecificationDTO> dtos = devices.stream()
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

            logger.info("getDevices returning {} devices for userId={}", dtos.size(), userId);
            return dtos;

        } catch (Exception e) {
            logger.error("Unexpected error in getDevices for userId={}", userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.GENERIC_ERROR);
        }
    }
}
