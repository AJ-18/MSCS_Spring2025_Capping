package com.project.spar.service;

import com.project.spar.constants.AppConstants;
import com.project.spar.model.*;
import com.project.spar.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MetricsService {

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
        return deviceSpecificationRepository.save(deviceSpec);
    }

    @Transactional
    public CpuUsage saveCpuUsage(CpuUsage cpuUsage) {
        cpuUsageRepository.deleteByUserAndDevice(cpuUsage.getUser(), cpuUsage.getDevice());
        return cpuUsageRepository.save(cpuUsage);
    }

    @Transactional
    public RamUsage saveRamUsage(RamUsage ramUsage) {
        ramUsageRepository.deleteByUserAndDevice(ramUsage.getUser(), ramUsage.getDevice());
        return ramUsageRepository.save(ramUsage);
    }

    @Transactional
    public DiskUsage saveDiskUsage(DiskUsage diskUsage) {
        diskUsageRepository.deleteByUserAndDevice(diskUsage.getUser(), diskUsage.getDevice());
        return diskUsageRepository.save(diskUsage);
    }

    @Transactional
    public DiskIO saveDiskIO(DiskIO diskIO) {
        diskIORepository.deleteByUserAndDevice(diskIO.getUser(), diskIO.getDevice());
        return diskIORepository.save(diskIO);
    }

    @Transactional
    public ProcessStatus saveProcessStatus(ProcessStatus ps) {
        // 1. Save the new status
        ProcessStatus saved = processStatusRepository.save(ps);

        // 2. Fetch all statuses for this user+device, newest first
        List<ProcessStatus> all = processStatusRepository
                .findByUserAndDeviceOrderByTimestampDesc(ps.getUser(), ps.getDevice());

        // 3. If more than 50, delete the oldest beyond the 50 newest
        if (all.size() > AppConstants.MAX_PROCESSES) {
            all.subList(AppConstants.MAX_PROCESSES, all.size())
                    .forEach(processStatusRepository::delete);
        }

        return saved;
    }

    @Transactional
    public NetworkInterface saveNetworkInterface(NetworkInterface netIf) {
        return networkInterfaceRepository.save(netIf);
    }

    @Transactional
    public BatteryInfo saveBatteryInfo(BatteryInfo batteryInfo) {
        batteryInfoRepository.deleteByUserAndDevice(batteryInfo.getUser(), batteryInfo.getDevice());
        return batteryInfoRepository.save(batteryInfo);
    }

    // ───── Read methods for GET endpoints ─────────────────────────────────────

    public Optional<BatteryInfo> getLatestBatteryInfo(User user, DeviceSpecification device) {
        return batteryInfoRepository.findTopByUserAndDeviceOrderByTimestampDesc(user, device);
    }

    public Optional<CpuUsage> getLatestCpuUsage(User user, DeviceSpecification device) {
        return cpuUsageRepository.findTopByUserAndDeviceOrderByTimestampDesc(user, device);
    }

    public Optional<RamUsage> getLatestRamUsage(User user, DeviceSpecification device) {
        return ramUsageRepository.findTopByUserAndDeviceOrderByTimestampDesc(user, device);
    }

    public Optional<DiskUsage> getLatestDiskUsage(User user, DeviceSpecification device) {
        return diskUsageRepository.findTopByUserAndDeviceOrderByTimestampDesc(user, device);
    }

    public Optional<DiskIO> getLatestDiskIO(User user, DeviceSpecification device) {
        return diskIORepository.findTopByUserAndDeviceOrderByTimestampDesc(user, device);
    }

    public List<ProcessStatus> getProcessStatuses(User user, DeviceSpecification device) {
        // returns up to the 50 most recent (service layer already prunes on save)
        return processStatusRepository.findByUserAndDeviceOrderByTimestampDesc(user, device)
                .stream()
                .limit(50)
                .toList();
    }

}
