package com.project.spar.repository;

import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.project.spar.model.ProcessStatus;

import java.util.List;

@Repository
public interface ProcessStatusRepository extends JpaRepository<ProcessStatus, Long> {
    List<ProcessStatus> findByUserIdAndDevice_DeviceId(Long userId, String deviceId);
    // fetch all statuses newest‑first so the service can prune/limit to 50
    List<ProcessStatus> findByUserAndDeviceOrderByTimestampDesc(User user, DeviceSpecification device);

}
