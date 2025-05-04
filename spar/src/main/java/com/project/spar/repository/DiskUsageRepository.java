package com.project.spar.repository;

import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.DiskUsage;
import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiskUsageRepository extends JpaRepository<DiskUsage, Long> {
    void deleteByUserAndDevice(User user, DeviceSpecification device);
    List<DiskUsage> findByUserAndDeviceOrderByTimestampDesc(User user, DeviceSpecification device);


}
