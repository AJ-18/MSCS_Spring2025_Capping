package com.project.spar.repository;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceSpecificationRepository extends JpaRepository<DeviceSpecification,Long> {
    Optional<DeviceSpecification> findByUserAndDeviceId(User user, String deviceId);
    Optional<DeviceSpecification> findByUserAndDeviceName(User user, String deviceName);
    List<DeviceSpecification> findAllByUser(User user);
}
