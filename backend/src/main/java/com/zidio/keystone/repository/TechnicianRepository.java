package com.zidio.keystone.repository;

import com.zidio.keystone.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByUserId(Long userId);
    List<Technician> findByAvailability(Technician.AvailabilityStatus availability);
}
