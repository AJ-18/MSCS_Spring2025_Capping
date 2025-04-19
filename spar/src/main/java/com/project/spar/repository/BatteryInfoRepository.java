package com.project.spar.repository;

import com.project.spar.model.BatteryInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatteryInfoRepository extends JpaRepository<BatteryInfo, Long> {
    List<BatteryInfo> findByUserId(String userId);
}
