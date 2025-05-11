package com.project.spar.service;

import com.project.spar.constants.AppConstants;
import com.project.spar.dto.*;
import com.project.spar.model.*;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class MetricsBatchService {

    private static final Logger logger = LoggerFactory.getLogger(MetricsBatchService.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private DeviceSpecificationRepository deviceRepo;

    @Autowired
    private MetricsService metricsService;

    @Transactional
    public String addMetrics(MetricsBatchDTO batch) {
        Long userId = batch.getUserId();
        String deviceId = batch.getDeviceId();
        logger.info("addMetrics called for userId={} deviceId={}", userId, deviceId);
        try {
            // 1) resolve managed User
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> {
                        String msg = AppConstants.UNKNOWN_USER_ID + '=' + userId;
                        logger.warn("User resolution failed in addMetrics: {}", msg);
                        return new IllegalArgumentException(msg);
                    });

            // 2) resolve managed DeviceSpecification
            DeviceSpecification device = deviceRepo.findByUserAndDeviceId(user, deviceId)
                    .orElseThrow(() -> {
                        String msg = AppConstants.DEVICE + deviceId + AppConstants.NOT_REGISTERED_FOR_USER + userId;
                        logger.warn("Device resolution failed in addMetrics: {}", msg);
                        return new IllegalArgumentException(msg);
                    });

            // 3) BatteryInfo
            BatteryInfoDTO biDto = batch.getBatteryInfo();
            if (biDto != null) {
                logger.debug("Persisting BatteryInfo for userId={} deviceId={}", userId, deviceId);
                BatteryInfo bi = new BatteryInfo();
                bi.setHasBattery(biDto.isHasBattery());
                bi.setBatteryPercentage(biDto.getBatteryPercentage());
                bi.setCharging(biDto.isCharging());
                bi.setPowerConsumption(biDto.getPowerConsumption());
                bi.setUser(user);
                bi.setDevice(device);
                metricsService.saveBatteryInfo(bi);
            }

            // 4) CpuUsage
            CpuUsageDTO cuDto = batch.getCpuUsage();
            if (cuDto != null) {
                logger.debug("Persisting CpuUsage for userId={} deviceId={}", userId, deviceId);
                CpuUsage cu = new CpuUsage();
                cu.setTotalCpuLoad(cuDto.getTotalCpuLoad());
                cu.setPerCoreUsageJson(cuDto.getPerCoreUsageJson());
                cu.setUser(user);
                cu.setDevice(device);
                metricsService.saveCpuUsage(cu);
            }

            // 5) RamUsage
            RamUsageDTO ruDto = batch.getRamUsage();
            if (ruDto != null) {
                logger.debug("Persisting RamUsage for userId={} deviceId={}", userId, deviceId);
                RamUsage ru = new RamUsage();
                ru.setTotalMemory(ruDto.getTotalMemory());
                ru.setUsedMemory(ruDto.getUsedMemory());
                ru.setAvailableMemory(ruDto.getAvailableMemory());
                ru.setUser(user);
                ru.setDevice(device);
                metricsService.saveRamUsage(ru);
            }

            // 6) Disk I/O
            DiskIODTO dioDto = batch.getDiskIO();
            if (dioDto != null) {
                logger.debug("Persisting DiskIO for userId={} deviceId={}", userId, deviceId);
                DiskIO dio = new DiskIO();
                dio.setReadSpeedMBps(dioDto.getReadSpeedMBps());
                dio.setWriteSpeedMBps(dioDto.getWriteSpeedMBps());
                dio.setUser(user);
                dio.setDevice(device);
                metricsService.saveDiskIO(dio);
            }

            // 7) DiskUsage
            List<DiskUsageDTO> duList = batch.getDiskUsage();
            if (duList != null) {
                logger.debug("Clearing old DiskUsage for userId={} deviceId={}", userId, deviceId);
                metricsService.deleteAllDiskUsageFor(user, device);
                for (DiskUsageDTO duDto : duList) {
                    logger.debug("Persisting DiskUsage entry for fs={} userId={} deviceId={}", duDto.getFilesystem(), userId, deviceId);
                    DiskUsage du = new DiskUsage();
                    du.setFilesystem(duDto.getFilesystem());
                    du.setSizeGB(duDto.getSizeGB());
                    du.setUsedGB(duDto.getUsedGB());
                    du.setAvailableGB(duDto.getAvailableGB());
                    du.setUser(user);
                    du.setDevice(device);
                    metricsService.saveDiskUsage(du);
                }

                // 8) ProcessStatus
                List<ProcessStatusDTO> psList = batch.getProcessStatuses();
                if (psList != null) {
                    for (ProcessStatusDTO psDto : psList) {
                        logger.debug("Persisting ProcessStatus pid={} userId={} deviceId={}", psDto.getPid(), userId, deviceId);
                        ProcessStatus ps = new ProcessStatus();
                        ps.setPid(psDto.getPid());
                        ps.setName(psDto.getName());
                        ps.setCpuUsage(psDto.getCpuUsage());
                        ps.setMemoryMB(psDto.getMemoryMB());
                        ps.setUser(user);
                        ps.setDevice(device);
                        metricsService.saveProcessStatus(ps);
                    }
                }
            }

            logger.info("addMetrics completed successfully for userId={} deviceId={}", userId, deviceId);
            return AppConstants.METRIC_SUCCESS;
        } catch (IllegalArgumentException e) {
            // propagate known input validation errors without stack trace
            throw e;
        } catch (Exception e) {
            logger.error("Error in addMetrics for userId={} deviceId={}", userId, deviceId, e);
            throw new RuntimeException(AppConstants.ERROR_GENERIC);
        }
    }
}