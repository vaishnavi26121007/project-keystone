package com.zidio.keystone.repository;

import com.zidio.keystone.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByWorkOrderId(Long workOrderId);
    List<TimeLog> findByTechnicianIdAndEndTimeIsNull(Long technicianId);
    Optional<TimeLog> findByWorkOrderIdAndTechnicianIdAndEndTimeIsNull(Long workOrderId, Long technicianId);
}
