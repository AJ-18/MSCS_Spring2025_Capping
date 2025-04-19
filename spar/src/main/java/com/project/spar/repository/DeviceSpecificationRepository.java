package com.project.spar.repository;

import com.project.spar.model.DeviceSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceSpecificationRepository extends JpaRepository<DeviceSpecification, Long> {
    List<DeviceSpecification> findByUserId(String userId);
}
