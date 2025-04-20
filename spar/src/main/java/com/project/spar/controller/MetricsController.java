package com.project.spar.controller;

import com.project.spar.dto.*;
import com.project.spar.model.*;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.UserRepository;
import com.project.spar.service.MetricsService;
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
    public ResponseEntity<DeviceSpecification> addDeviceSpecification(@RequestBody DeviceSpecification ds) {
        var user = userRepo.findById(ds.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        ds.setUser(user);
        return ResponseEntity.ok(metricsService.saveDeviceSpecification(ds));
    }

    /**
     * Helper to attach User and DeviceSpecification entities based on IDs in the payload.
     */
    private DeviceSpecification lookupDevice(Long userId, String deviceId) {
        var user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return deviceRepo.findByUserAndDeviceId(user, deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Device not registered"));
    }

    @PostMapping("/cpu-usage")
    public ResponseEntity<CpuUsageDTO> addCpuUsage(@RequestBody CpuUsage cu) {
        cu.setUser(userRepo.getReferenceById(cu.getUser().getId()));
        cu.setDevice(lookupDevice(cu.getUser().getId(), cu.getDevice().getDeviceId()));
        CpuUsage saved = metricsService.saveCpuUsage(cu);
        CpuUsageDTO dto = new CpuUsageDTO(
                saved.getId(),
                saved.getTotalCpuLoad(),
                saved.getPerCoreUsageJson(),
                saved.getUser().getId(),
                saved.getDevice().getDeviceId(),
                saved.getTimestamp()
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/ram-usage")
    public ResponseEntity<RamUsageDTO> addRamUsage(@RequestBody RamUsage ru) {
        ru.setUser(userRepo.getReferenceById(ru.getUser().getId()));
        ru.setDevice(lookupDevice(ru.getUser().getId(), ru.getDevice().getDeviceId()));
        RamUsage saved = metricsService.saveRamUsage(ru);
        RamUsageDTO dto = new RamUsageDTO(
                saved.getId(),
                saved.getTotalMemory(),
                saved.getUsedMemory(),
                saved.getAvailableMemory(),
                saved.getUser().getId(),
                saved.getDevice().getDeviceId(),
                saved.getTimestamp()
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/disk-io")
    public ResponseEntity<DiskIODTO> addDiskIO(@RequestBody DiskIO dio) {
        dio.setUser(userRepo.getReferenceById(dio.getUser().getId()));
        dio.setDevice(lookupDevice(dio.getUser().getId(), dio.getDevice().getDeviceId()));
        DiskIO saved = metricsService.saveDiskIO(dio);
        DiskIODTO dto = new DiskIODTO(
                saved.getId(),
                saved.getReadSpeedMBps(),
                saved.getWriteSpeedMBps(),
                saved.getUser().getId(),
                saved.getDevice().getDeviceId(),
                saved.getTimestamp()
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/disk-usage")
    public ResponseEntity<DiskUsageDTO> addDiskUsage(@RequestBody DiskUsage du) {
        du.setUser(userRepo.getReferenceById(du.getUser().getId()));
        du.setDevice(lookupDevice(du.getUser().getId(), du.getDevice().getDeviceId()));
        DiskUsage saved = metricsService.saveDiskUsage(du);
        DiskUsageDTO dto = new DiskUsageDTO(
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
    }

    @PostMapping("/network-interfaces")
    public ResponseEntity<NetworkInterfaceDTO> addNetworkInterface(@RequestBody NetworkInterface ni) {
        ni.setUser(userRepo.getReferenceById(ni.getUser().getId()));
        ni.setDevice(lookupDevice(ni.getUser().getId(), ni.getDevice().getDeviceId()));
        NetworkInterface saved = metricsService.saveNetworkInterface(ni);
        NetworkInterfaceDTO dto = new NetworkInterfaceDTO(
                saved.getId(),
                saved.getIface(),
                saved.getIpAddress(),
                saved.getMacAddress(),
                saved.getSpeedMbps(),
                saved.getUser().getId(),
                saved.getDevice().getDeviceId(),
                saved.getTimestamp()
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/process-status")
    public ResponseEntity<List<ProcessStatusDTO>> addProcessStatus(
            @RequestBody List<ProcessStatus> psList) {

        List<ProcessStatusDTO> dtos = psList.stream()
                .map(ps -> {
                    // Attach user & device on each item
                    ps.setUser(userRepo.getReferenceById(ps.getUser().getId()));
                    ps.setDevice(lookupDevice(ps.getUser().getId(), ps.getDevice().getDeviceId()));
                    // Save
                    ProcessStatus saved = metricsService.saveProcessStatus(ps);
                    // Map to DTO
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

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/battery-info")
    public ResponseEntity<BatteryInfoDTO> addBatteryInfo(@RequestBody BatteryInfo bi) {
        bi.setUser(userRepo.getReferenceById(bi.getUser().getId()));
        bi.setDevice(lookupDevice(bi.getUser().getId(), bi.getDevice().getDeviceId()));
        BatteryInfo saved = metricsService.saveBatteryInfo(bi);
        BatteryInfoDTO dto = new BatteryInfoDTO(
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
    }
}
