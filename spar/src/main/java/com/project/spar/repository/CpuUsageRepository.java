package com.project.spar.repository;

import com.project.spar.model.CpuUsage;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CpuUsageRepository extends JpaRepository<CpuUsage, Long> {
    void deleteByUserAndDevice(User user, DeviceSpecification device);
    Optional<CpuUsage> findTopByUserAndDeviceOrderByTimestampDesc(User user, DeviceSpecification device);

}
