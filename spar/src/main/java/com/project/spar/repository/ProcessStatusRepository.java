package com.project.spar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.project.spar.model.ProcessStatus;

import java.util.List;

@Repository
public interface ProcessStatusRepository extends JpaRepository<ProcessStatus, Long> {
    List<ProcessStatus> findByUserId(String userId);
}
