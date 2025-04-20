package com.project.spar.repository;

import com.project.spar.model.CpuUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CpuUsageRepository extends JpaRepository<CpuUsage, Long> {
}
