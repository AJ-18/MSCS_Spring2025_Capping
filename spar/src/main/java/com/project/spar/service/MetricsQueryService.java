package com.project.spar.service;

import com.project.spar.model.BatteryInfo;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.ProcessStatus;
import com.project.spar.model.RamUsage;
import com.project.spar.repository.BatteryInfoRepository;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.ProcessStatusRepository;
import com.project.spar.repository.RamUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MetricsQueryService {
    @Autowired
    private DeviceSpecificationRepository deviceSpecRepo;
    @Autowired private ProcessStatusRepository processRepo;
    @Autowired private BatteryInfoRepository batteryRepo;
    @Autowired private RamUsageRepository memoryRepo;

    /*public List<DeviceSpecification> getDeviceSpecs(String userId) {
        return deviceSpecRepo.findByUserId(userId);
    }*/
    public List<ProcessStatus> getProcessStatus(Long userId, String deviceId) {
        return processRepo.findByUserIdAndDevice_DeviceId(userId,deviceId);
    }
    public List<BatteryInfo> getBatteryInfo(Long userId, String deviceId) {
        return batteryRepo.findByUserIdAndDevice_DeviceId(userId,deviceId);
    }
    public List<RamUsage> getRamUsage(Long userId, String deviceId) {
        return memoryRepo.findByUserIdAndDevice_DeviceId(userId,deviceId);
    }
}
