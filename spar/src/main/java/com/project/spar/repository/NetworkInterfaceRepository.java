package com.project.spar.repository;

import com.project.spar.model.NetworkInterface;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NetworkInterfaceRepository extends JpaRepository<NetworkInterface, Long> {
}

