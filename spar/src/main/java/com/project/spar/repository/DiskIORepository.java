package com.project.spar.repository;

import com.project.spar.model.DiskIO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiskIORepository extends JpaRepository<DiskIO, Long> {
}

