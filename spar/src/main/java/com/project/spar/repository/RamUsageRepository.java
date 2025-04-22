package com.project.spar.repository;

import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.RamUsage;
import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RamUsageRepository extends JpaRepository<RamUsage, Long> {
    List<RamUsage> findByUserIdAndDevice_DeviceId(Long userId, String deviceId);
    void deleteByUserAndDevice(User user, DeviceSpecification device);
    Optional<RamUsage> findTopByUserAndDeviceOrderByTimestampDesc(User user, DeviceSpecification device);


}
