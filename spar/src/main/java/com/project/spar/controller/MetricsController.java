package com.project.spar.controller;

import com.project.spar.constants.AppConstants;
import com.project.spar.dto.*;
import com.project.spar.model.*;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.UserRepository;
import com.project.spar.service.MetricsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsController {

    private static final Logger logger = LoggerFactory.getLogger(MetricsController.class);

    @Autowired
    private MetricsService metricsService;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private DeviceSpecificationRepository deviceRepo;

    /**
     * Register a new device for a user.
     */
    @PostMapping("/device-specifications")
    public ResponseEntity<?> addDeviceSpecification(@RequestBody DeviceSpecification ds) {
        logger.info("addDeviceSpecification called for userId={}", ds.getUser() != null ? ds.getUser().getId() : null);
        try {
            var user = userRepo.findById(ds.getUser().getId())
                    .orElseThrow(() -> {
                        logger.warn("User not found in addDeviceSpecification for id={}", ds.getUser().getId());
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.USER_NOT_FOUND);
                    });
            ds.setUser(user);
            var saved = metricsService.saveDeviceSpecification(ds);
            logger.info("addDeviceSpecification successful for userId={}", user.getId());
            return ResponseEntity.ok(saved);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error in addDeviceSpecification", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }

    /**
     * Helper to attach User and DeviceSpecification entities based on IDs in the payload.
     */
    private DeviceSpecification lookupDevice(Long userId, String deviceId) {
        logger.debug("lookupDevice called for userId={} deviceId={}", userId, deviceId);
        var user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.USER_NOT_FOUND));
        return deviceRepo.findByUserAndDeviceId(user, deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, AppConstants.DEVICE_NOT_REGISTERED));
    }

    @PostMapping("/cpu-usage")
    public ResponseEntity<?> addCpuUsage(@RequestBody CpuUsage cu) {
        logger.info("addCpuUsage called for userId={}", cu.getUser() != null ? cu.getUser().getId() : null);
        try {
            cu.setUser(userRepo.getReferenceById(cu.getUser().getId()));
            cu.setDevice(lookupDevice(cu.getUser().getId(), cu.getDevice().getDeviceId()));
            var saved = metricsService.saveCpuUsage(cu);
            logger.info("addCpuUsage successful for id={}", saved.getId());
            var dto = new CpuUsageDTO(
                    saved.getId(),
                    saved.getTotalCpuLoad(),
                    saved.getPerCoreUsageJson(),
                    saved.getUser().getId(),
                    saved.getDevice().getDeviceId(),
                    saved.getTimestamp()
            );
            return ResponseEntity.ok(dto);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error in addCpuUsage", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }

    @PostMapping("/ram-usage")
    public ResponseEntity<?> addRamUsage(@RequestBody RamUsage ru) {
        logger.info("addRamUsage called for userId={}", ru.getUser() != null ? ru.getUser().getId() : null);
        try {
            ru.setUser(userRepo.getReferenceById(ru.getUser().getId()));
            ru.setDevice(lookupDevice(ru.getUser().getId(), ru.getDevice().getDeviceId()));
            var saved = metricsService.saveRamUsage(ru);
            logger.info("addRamUsage successful for id={}", saved.getId());
            var dto = new RamUsageDTO(
                    saved.getId(),
                    saved.getTotalMemory(),
                    saved.getUsedMemory(),
                    saved.getAvailableMemory(),
                    saved.getUser().getId(),
                    saved.getDevice().getDeviceId(),
                    saved.getTimestamp()
            );
            return ResponseEntity.ok(dto);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error in addRamUsage", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }

    @PostMapping("/disk-io")
    public ResponseEntity<?> addDiskIO(@RequestBody DiskIO dio) {
        logger.info("addDiskIO called for userId={}", dio.getUser() != null ? dio.getUser().getId() : null);
        try {
            dio.setUser(userRepo.getReferenceById(dio.getUser().getId()));
            dio.setDevice(lookupDevice(dio.getUser().getId(), dio.getDevice().getDeviceId()));
            var saved = metricsService.saveDiskIO(dio);
            logger.info("addDiskIO successful for id={}", saved.getId());
            var dto = new DiskIODTO(
                    saved.getId(),
                    saved.getReadSpeedMBps(),
                    saved.getWriteSpeedMBps(),
                    saved.getUser().getId(),
                    saved.getDevice().getDeviceId(),
                    saved.getTimestamp()
            );
            return ResponseEntity.ok(dto);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error in addDiskIO", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }

    @PostMapping("/disk-usage")
    public ResponseEntity<?> addDiskUsage(@RequestBody DiskUsage du) {
        logger.info("addDiskUsage called for userId={}", du.getUser() != null ? du.getUser().getId() : null);
        try {
            du.setUser(userRepo.getReferenceById(du.getUser().getId()));
            du.setDevice(lookupDevice(du.getUser().getId(), du.getDevice().getDeviceId()));
            var saved = metricsService.saveDiskUsage(du);
            logger.info("addDiskUsage successful for id={}", saved.getId());
            var dto = new DiskUsageDTO(
                    saved.getId(),
                    saved.getFilesystem(),
                    saved.getSizeGB(),
                    saved.getUsedGB(),
                    saved.getAvailableGB(),
                    saved.getUser().getId(),
                    saved.getDevice().getDeviceId(),
                    saved.getTimestamp()
            );
            return ResponseEntity.ok(dto);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error in addDiskUsage", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }



    @PostMapping("/process-status")
    public ResponseEntity<?> addProcessStatus(
            @RequestBody List<ProcessStatus> psList) {
        logger.info("addProcessStatus called for userId={} count={}",
                psList.isEmpty() ? null : psList.get(0).getUser().getId(), psList.size());
        try {
            var dtos = psList.stream()
                    .map(ps -> {
                        ps.setUser(userRepo.getReferenceById(ps.getUser().getId()));
                        ps.setDevice(lookupDevice(ps.getUser().getId(), ps.getDevice().getDeviceId()));
                        var saved = metricsService.saveProcessStatus(ps);
                        return new ProcessStatusDTO(
                                saved.getId(),
                                saved.getPid(),
                                saved.getName(),
                                saved.getCpuUsage(),
                                saved.getMemoryMB(),
                                saved.getUser().getId(),
                                saved.getDevice().getDeviceId(),
                                saved.getTimestamp()
                        );
                    })
                    .collect(Collectors.toList());
            logger.info("addProcessStatus successful for count={}", dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error in addProcessStatus", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }

    @PostMapping("/battery-info")
    public ResponseEntity<?> addBatteryInfo(@RequestBody BatteryInfo bi) {
        logger.info("addBatteryInfo called for userId={}", bi.getUser() != null ? bi.getUser().getId() : null);
        try {
            bi.setUser(userRepo.getReferenceById(bi.getUser().getId()));
            bi.setDevice(lookupDevice(bi.getUser().getId(), bi.getDevice().getDeviceId()));
            var saved = metricsService.saveBatteryInfo(bi);
            logger.info("addBatteryInfo successful for id={}", saved.getId());
            var dto = new BatteryInfoDTO(
                    saved.getId(),
                    saved.isHasBattery(),
                    saved.getBatteryPercentage(),
                    saved.isCharging(),
                    saved.getPowerConsumption(),
                    saved.getUser().getId(),
                    saved.getDevice().getDeviceId(),
                    saved.getTimestamp()
            );
            return ResponseEntity.ok(dto);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error in addBatteryInfo", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.ERROR_GENERIC);
        }
    }

    // ───── GET ENDPOINTS ───────────────────────────

    @GetMapping("/battery-info/{userId}/{deviceId}")
    public ResponseEntity<BatteryInfoDTO> getLatestBatteryInfo(@PathVariable Long userId,
                                                               @PathVariable String deviceId) {
        logger.info("getLatestBatteryInfo called for userId={} deviceId={}", userId, deviceId);
        var user = userRepo.getReferenceById(userId);
        var device = lookupDevice(userId, deviceId);
        var bi = metricsService.getLatestBatteryInfo(user, device)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.ERROR_NOT_FOUND));
        return ResponseEntity.ok(new BatteryInfoDTO(
                bi.getId(),
                bi.isHasBattery(),
                bi.getBatteryPercentage(),
                bi.isCharging(),
                bi.getPowerConsumption(),
                userId,
                deviceId,
                bi.getTimestamp()
        ));
    }

    @GetMapping("/cpu-usage/{userId}/{deviceId}")
    public ResponseEntity<CpuUsageDTO> getLatestCpuUsage(@PathVariable Long userId,
                                                         @PathVariable String deviceId) {
        logger.info("getLatestCpuUsage called for userId={} deviceId={}", userId, deviceId);
        var user = userRepo.getReferenceById(userId);
        var device = lookupDevice(userId, deviceId);
        var cu = metricsService.getLatestCpuUsage(user, device)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.ERROR_NOT_FOUND));
        return ResponseEntity.ok(new CpuUsageDTO(
                cu.getId(),
                cu.getTotalCpuLoad(),
                cu.getPerCoreUsageJson(),
                userId,
                deviceId,
                cu.getTimestamp()
        ));
    }

    @GetMapping("/ram-usage/{userId}/{deviceId}")
    public ResponseEntity<RamUsageDTO> getLatestRamUsage(@PathVariable Long userId,
                                                         @PathVariable String deviceId) {
        logger.info("getLatestRamUsage called for userId={} deviceId={}", userId, deviceId);
        var user = userRepo.getReferenceById(userId);
        var device = lookupDevice(userId, deviceId);
        var ru = metricsService.getLatestRamUsage(user, device)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.ERROR_NOT_FOUND));
        return ResponseEntity.ok(new RamUsageDTO(
                ru.getId(),
                ru.getTotalMemory(),
                ru.getUsedMemory(),
                ru.getAvailableMemory(),
                userId,
                deviceId,
                ru.getTimestamp()
        ));
    }

    @GetMapping("/disk-io/{userId}/{deviceId}")
    public ResponseEntity<DiskIODTO> getLatestDiskIO(@PathVariable Long userId,
                                                     @PathVariable String deviceId) {
        logger.info("getLatestDiskIO called for userId={} deviceId={}", userId, deviceId);
        var user = userRepo.getReferenceById(userId);
        var device = lookupDevice(userId, deviceId);
        var dio = metricsService.getLatestDiskIO(user, device)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.ERROR_NOT_FOUND));
        return ResponseEntity.ok(new DiskIODTO(
                dio.getId(),
                dio.getReadSpeedMBps(),
                dio.getWriteSpeedMBps(),
                userId,
                deviceId,
                dio.getTimestamp()
        ));
    }

    @GetMapping("/disk-usage/{userId}/{deviceId}")
    public ResponseEntity<List<DiskUsageDTO>> getLatestDiskUsage(@PathVariable Long userId,
                                                                 @PathVariable String deviceId) {
        logger.info("getLatestDiskUsage called for userId={} deviceId={}", userId, deviceId);
        var user = userRepo.getReferenceById(userId);
        var device = lookupDevice(userId, deviceId);
        List<DiskUsage> duList = metricsService.getLatestDiskUsage(user, device);
        if (duList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstants.ERROR_NOT_FOUND);
        }
        // Convert to DTOs
        List<DiskUsageDTO> dtoList = duList.stream()
                .map(du -> new DiskUsageDTO(
                        du.getId(),
                        du.getFilesystem(),
                        du.getSizeGB(),
                        du.getUsedGB(),
                        du.getAvailableGB(),
                        userId,
                        deviceId,
                        du.getTimestamp()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }


    @GetMapping("/process-status/{userId}/{deviceId}")
    public ResponseEntity<List<ProcessStatusDTO>> getProcessStatuses(@PathVariable Long userId,
                                                                     @PathVariable String deviceId) {
        logger.info("getProcessStatuses called for userId={} deviceId={}", userId, deviceId);
        var user = userRepo.getReferenceById(userId);
        var device = lookupDevice(userId, deviceId);
        var list = metricsService.getProcessStatuses(user, device);
        var dtos = list.stream()
                .map(ps -> new ProcessStatusDTO(
                        ps.getId(),
                        ps.getPid(),
                        ps.getName(),
                        ps.getCpuUsage(),
                        ps.getMemoryMB(),
                        userId,
                        deviceId,
                        ps.getTimestamp()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
