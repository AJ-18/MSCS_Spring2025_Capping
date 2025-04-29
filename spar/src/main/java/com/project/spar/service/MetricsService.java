package com.project.spar.service;

import com.project.spar.constants.AppConstants;
import com.project.spar.model.*;
import com.project.spar.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MetricsService {

    private static final Logger logger = LoggerFactory.getLogger(MetricsService.class);

    @Autowired
    private DeviceSpecificationRepository deviceSpecificationRepository;

    @Autowired
    private CpuUsageRepository cpuUsageRepository;

    @Autowired
    private RamUsageRepository ramUsageRepository;

    @Autowired
    private DiskUsageRepository diskUsageRepository;

    @Autowired
    private DiskIORepository diskIORepository;

    @Autowired
    private ProcessStatusRepository processStatusRepository;

    @Autowired
    private NetworkInterfaceRepository networkInterfaceRepository;

    @Autowired
    private BatteryInfoRepository batteryInfoRepository;

    @Transactional
    public DeviceSpecification saveDeviceSpecification(DeviceSpecification deviceSpec) {
        Long userId = deviceSpec.getUser().getId();
        try {
            logger.info("saveDeviceSpecification called for userId={}", userId);
            DeviceSpecification saved = deviceSpecificationRepository.save(deviceSpec);
            logger.info("saveDeviceSpecification succeeded for userId={}", userId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveDeviceSpecification for userId={}", userId, e);
            throw e;
        }
    }

    @Transactional
    public CpuUsage saveCpuUsage(CpuUsage cpuUsage) {
        Long userId = cpuUsage.getUser().getId();
        String deviceId = cpuUsage.getDevice().getDeviceId();
        try {
            logger.info("saveCpuUsage called for userId={}, deviceId={}", userId, deviceId);
            cpuUsageRepository.deleteByUserAndDevice(cpuUsage.getUser(), cpuUsage.getDevice());
            logger.debug("Old CPU usage entries deleted for userId={}, deviceId={}", userId, deviceId);
            CpuUsage saved = cpuUsageRepository.save(cpuUsage);
            logger.info("saveCpuUsage succeeded for userId={}, deviceId={}", userId, deviceId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveCpuUsage for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    @Transactional
    public RamUsage saveRamUsage(RamUsage ramUsage) {
        Long userId = ramUsage.getUser().getId();
        String deviceId = ramUsage.getDevice().getDeviceId();
        try {
            logger.info("saveRamUsage called for userId={}, deviceId={}", userId, deviceId);
            ramUsageRepository.deleteByUserAndDevice(ramUsage.getUser(), ramUsage.getDevice());
            logger.debug("Old RAM usage entries deleted for userId={}, deviceId={}", userId, deviceId);
            RamUsage saved = ramUsageRepository.save(ramUsage);
            logger.info("saveRamUsage succeeded for userId={}, deviceId={}", userId, deviceId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveRamUsage for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    @Transactional
    public DiskUsage saveDiskUsage(DiskUsage diskUsage) {
        Long userId = diskUsage.getUser().getId();
        String deviceId = diskUsage.getDevice().getDeviceId();
        try {
            logger.info("saveDiskUsage called for userId={}, deviceId={}", userId, deviceId);
            DiskUsage saved = diskUsageRepository.save(diskUsage);
            logger.info("saveDiskUsage succeeded for userId={}, deviceId={}", userId, deviceId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveDiskUsage for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    @Transactional
    public void deleteAllDiskUsageFor(User user, DeviceSpecification device) {
        Long userId = user.getId();
        String deviceId = device.getDeviceId();
        try {
            logger.info("deleteAllDiskUsageFor called for userId={}, deviceId={}", userId, deviceId);
            diskUsageRepository.deleteByUserAndDevice(user, device);
            logger.info("deleteAllDiskUsageFor succeeded for userId={}, deviceId={}", userId, deviceId);
        } catch (Exception e) {
            logger.error("Error in deleteAllDiskUsageFor for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    @Transactional
    public DiskIO saveDiskIO(DiskIO diskIO) {
        Long userId = diskIO.getUser().getId();
        String deviceId = diskIO.getDevice().getDeviceId();
        try {
            logger.info("saveDiskIO called for userId={}, deviceId={}", userId, deviceId);
            diskIORepository.deleteByUserAndDevice(diskIO.getUser(), diskIO.getDevice());
            logger.debug("Old Disk I/O entries deleted for userId={}, deviceId={}", userId, deviceId);
            DiskIO saved = diskIORepository.save(diskIO);
            logger.info("saveDiskIO succeeded for userId={}, deviceId={}", userId, deviceId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveDiskIO for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    @Transactional
    public ProcessStatus saveProcessStatus(ProcessStatus ps) {
        Long userId = ps.getUser().getId();
        String deviceId = ps.getDevice().getDeviceId();
        try {
            logger.info("saveProcessStatus called for userId={}, deviceId={}", userId, deviceId);
            ProcessStatus saved = processStatusRepository.save(ps);
            logger.debug("New process status saved (pid={}) for userId={}, deviceId={}",
                    ps.getPid(), userId, deviceId);

            List<ProcessStatus> all = processStatusRepository
                    .findByUserAndDeviceOrderByTimestampDesc(ps.getUser(), ps.getDevice());
            if (all.size() > AppConstants.MAX_PROCESSES) {
                all.subList(AppConstants.MAX_PROCESSES, all.size())
                        .forEach(dead -> processStatusRepository.delete(dead));
                logger.debug("Old process statuses pruned to max {} entries for userId={}, deviceId={}",
                        AppConstants.MAX_PROCESSES, userId, deviceId);
            }

            logger.info("saveProcessStatus succeeded for userId={}, deviceId={}", userId, deviceId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveProcessStatus for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    @Transactional
    public NetworkInterface saveNetworkInterface(NetworkInterface netIf) {
        Long userId = netIf.getUser().getId();
        String deviceId = netIf.getDevice().getDeviceId();
        try {
            logger.info("saveNetworkInterface called for userId={}, deviceId={}", userId, deviceId);
            NetworkInterface saved = networkInterfaceRepository.save(netIf);
            logger.info("saveNetworkInterface succeeded for userId={}, deviceId={}", userId, deviceId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveNetworkInterface for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    @Transactional
    public BatteryInfo saveBatteryInfo(BatteryInfo batteryInfo) {
        Long userId = batteryInfo.getUser().getId();
        String deviceId = batteryInfo.getDevice().getDeviceId();
        try {
            logger.info("saveBatteryInfo called for userId={}, deviceId={}", userId, deviceId);
            batteryInfoRepository.deleteByUserAndDevice(batteryInfo.getUser(), batteryInfo.getDevice());
            logger.debug("Old battery info deleted for userId={}, deviceId={}", userId, deviceId);
            BatteryInfo saved = batteryInfoRepository.save(batteryInfo);
            logger.info("saveBatteryInfo succeeded for userId={}, deviceId={}", userId, deviceId);
            return saved;
        } catch (Exception e) {
            logger.error("Error in saveBatteryInfo for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    public Optional<BatteryInfo> getLatestBatteryInfo(User user, DeviceSpecification device) {
        Long userId = user.getId();
        String deviceId = device.getDeviceId();
        try {
            logger.info("getLatestBatteryInfo called for userId={}, deviceId={}", userId, deviceId);
            Optional<BatteryInfo> result = batteryInfoRepository
                    .findTopByUserAndDeviceOrderByTimestampDesc(user, device);
            logger.info("getLatestBatteryInfo returned {} for userId={}, deviceId={}",
                    result.map(b -> "1 record").orElse("0 records"), userId, deviceId);
            return result;
        } catch (Exception e) {
            logger.error("Error in getLatestBatteryInfo for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    public Optional<CpuUsage> getLatestCpuUsage(User user, DeviceSpecification device) {
        Long userId = user.getId();
        String deviceId = device.getDeviceId();
        try {
            logger.info("getLatestCpuUsage called for userId={}, deviceId={}", userId, deviceId);
            Optional<CpuUsage> result = cpuUsageRepository
                    .findTopByUserAndDeviceOrderByTimestampDesc(user, device);
            logger.info("getLatestCpuUsage returned {} for userId={}, deviceId={}",
                    result.map(c -> "1 record").orElse("0 records"), userId, deviceId);
            return result;
        } catch (Exception e) {
            logger.error("Error in getLatestCpuUsage for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    public Optional<RamUsage> getLatestRamUsage(User user, DeviceSpecification device) {
        Long userId = user.getId();
        String deviceId = device.getDeviceId();
        try {
            logger.info("getLatestRamUsage called for userId={}, deviceId={}", userId, deviceId);
            Optional<RamUsage> result = ramUsageRepository
                    .findTopByUserAndDeviceOrderByTimestampDesc(user, device);
            logger.info("getLatestRamUsage returned {} for userId={}, deviceId={}",
                    result.map(r -> "1 record").orElse("0 records"), userId, deviceId);
            return result;
        } catch (Exception e) {
            logger.error("Error in getLatestRamUsage for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    public Optional<DiskUsage> getLatestDiskUsage(User user, DeviceSpecification device) {
        Long userId = user.getId();
        String deviceId = device.getDeviceId();
        try {
            logger.info("getLatestDiskUsage called for userId={}, deviceId={}", userId, deviceId);
            Optional<DiskUsage> result = diskUsageRepository
                    .findTopByUserAndDeviceOrderByTimestampDesc(user, device);
            logger.info("getLatestDiskUsage returned {} for userId={}, deviceId={}",
                    result.map(d -> "1 record").orElse("0 records"), userId, deviceId);
            return result;
        } catch (Exception e) {
            logger.error("Error in getLatestDiskUsage for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    public Optional<DiskIO> getLatestDiskIO(User user, DeviceSpecification device) {
        Long userId = user.getId();
        String deviceId = device.getDeviceId();
        try {
            logger.info("getLatestDiskIO called for userId={}, deviceId={}", userId, deviceId);
            Optional<DiskIO> result = diskIORepository
                    .findTopByUserAndDeviceOrderByTimestampDesc(user, device);
            logger.info("getLatestDiskIO returned {} for userId={}, deviceId={}",
                    result.map(d -> "1 record").orElse("0 records"), userId, deviceId);
            return result;
        } catch (Exception e) {
            logger.error("Error in getLatestDiskIO for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }

    public List<ProcessStatus> getProcessStatuses(User user, DeviceSpecification device) {
        Long userId = user.getId();
        String deviceId = device.getDeviceId();
        try {
            logger.info("getProcessStatuses called for userId={}, deviceId={}", userId, deviceId);
            List<ProcessStatus> list = processStatusRepository
                    .findByUserAndDeviceOrderByTimestampDesc(user, device)
                    .stream()
                    .limit(AppConstants.MAX_PROCESSES)
                    .toList();
            logger.info("getProcessStatuses returned {} entries for userId={}, deviceId={}",
                    list.size(), userId, deviceId);
            return list;
        } catch (Exception e) {
            logger.error("Error in getProcessStatuses for userId={}, deviceId={}", userId, deviceId, e);
            throw e;
        }
    }
}
