package com.project.spar.repository;

import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.DiskIO;
import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiskIORepository extends JpaRepository<DiskIO, Long> {
    void deleteByUserAndDevice(User user, DeviceSpecification device);
    Optional<DiskIO> findTopByUserAndDeviceOrderByTimestampDesc(User user, DeviceSpecification device);

}

