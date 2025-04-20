package com.project.spar.repository;

import com.project.spar.model.RamUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RamUsageRepository extends JpaRepository<RamUsage, Long> {
    List<RamUsage> findByUserId(String userId);
}
