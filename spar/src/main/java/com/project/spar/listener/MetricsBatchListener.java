package com.project.spar.listener;

import com.project.spar.dto.*;
import com.project.spar.model.*;
import com.project.spar.repository.DeviceSpecificationRepository;
import com.project.spar.repository.UserRepository;
import com.project.spar.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MetricsBatchListener {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private DeviceSpecificationRepository deviceRepo;

    @Autowired
    private MetricsService metricsService;

    @KafkaListener(topics = "spar-metrics-topic", groupId = "spar-metrics-group")
    public void onMessage(MetricsBatchDTO batch) {
        // 1) resolve managed User
        User user = userRepo.findById(batch.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Unknown userId=" + batch.getUserId()));

        // 2) resolve managed DeviceSpecification
        DeviceSpecification device = deviceRepo.findByUserAndDeviceId(user, batch.getDeviceId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Device " + batch.getDeviceId() + " not registered for user " + batch.getUserId()));

        // 3) BatteryInfo
        BatteryInfoDTO biDto = batch.getBatteryInfo();
        if (biDto != null) {
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
            DiskIO dio = new DiskIO();
            dio.setReadSpeedMBps(dioDto.getReadSpeedMBps());
            dio.setWriteSpeedMBps(dioDto.getWriteSpeedMBps());
            dio.setUser(user);
            dio.setDevice(device);
            metricsService.saveDiskIO(dio);
        }

        // 7) DiskUsage
        DiskUsageDTO duDto = batch.getDiskUsage();
        if (duDto != null) {
            DiskUsage du = new DiskUsage();
            du.setFilesystem(duDto.getFilesystem());
            du.setSizeGB(duDto.getSizeGB());
            du.setUsedGB(duDto.getUsedGB());
            du.setAvailableGB(duDto.getAvailableGB());
            du.setUser(user);
            du.setDevice(device);
            metricsService.saveDiskUsage(du);
        }



        // 9. ProcessStatus
        List<ProcessStatusDTO> psList = batch.getProcessStatuses();
        if (psList != null) {
            for (ProcessStatusDTO psDto : psList) {
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
}
