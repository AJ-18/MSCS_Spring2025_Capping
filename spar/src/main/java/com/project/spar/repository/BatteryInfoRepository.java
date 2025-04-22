package com.project.spar.repository;

import com.project.spar.model.BatteryInfo;
import com.project.spar.model.DeviceSpecification;
import com.project.spar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatteryInfoRepository extends JpaRepository<BatteryInfo, Long> {
    List<BatteryInfo> findByUserIdAndDevice_DeviceId(Long userId, String deviceId);
    // delete any existing BatteryInfo for that user+device
    void deleteByUserAndDevice(User user, DeviceSpecification device);

    // get the single latest BatteryInfo
    Optional<BatteryInfo> findTopByUserAndDeviceOrderByTimestampDesc(User user, DeviceSpecification device);


}
