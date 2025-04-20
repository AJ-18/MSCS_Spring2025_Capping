package com.project.spar.repository;

import com.project.spar.model.DiskUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiskUsageRepository extends JpaRepository<DiskUsage, Long> {
}
