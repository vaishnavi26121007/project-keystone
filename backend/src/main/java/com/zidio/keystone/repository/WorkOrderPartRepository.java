package com.zidio.keystone.repository;

import com.zidio.keystone.entity.WorkOrderPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderPartRepository extends JpaRepository<WorkOrderPart, Long> {
    List<WorkOrderPart> findByWorkOrderId(Long workOrderId);
}
