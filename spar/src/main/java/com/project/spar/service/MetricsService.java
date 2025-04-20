package com.project.spar.service;


import com.project.spar.model.*;
import com.project.spar.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public DeviceSpecification saveDeviceSpecification(DeviceSpecification deviceSpec) {
        return deviceSpecificationRepository.save(deviceSpec);
    }

    public CpuUsage saveCpuUsage(CpuUsage cpuUsage) {
        return cpuUsageRepository.save(cpuUsage);
    }

    public RamUsage saveMemoryUsage(RamUsage ramUsage) {
        return ramUsageRepository.save(ramUsage);
    }

    public DiskUsage saveDiskUsage(DiskUsage diskUsage) {
        return diskUsageRepository.save(diskUsage);
    }

    public DiskIO saveDiskIO(DiskIO diskIO) {
        return diskIORepository.save(diskIO);
    }

    public ProcessStatus saveProcessStatus(ProcessStatus processStatus) {
        return processStatusRepository.save(processStatus);
    }

    public NetworkInterface saveNetworkInterface(NetworkInterface networkInterface) {
        return networkInterfaceRepository.save(networkInterface);
    }

    public BatteryInfo saveBatteryInfo(BatteryInfo batteryInfo) {
        return batteryInfoRepository.save(batteryInfo);
    }
}
