package com.zidio.keystone.repository;

import com.zidio.keystone.entity.WorkOrder;
import com.zidio.keystone.entity.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByClientId(Long clientId);
    List<WorkOrder> findByAssignedTechnicianId(Long technicianId);
    List<WorkOrder> findByStatus(WorkOrderStatus status);

    @Query("SELECT w FROM WorkOrder w WHERE w.status NOT IN ('CLOSED','CANCELLED','COMPLETED') AND w.slaDueAt < :now")
    List<WorkOrder> findOverdue(@Param("now") LocalDateTime now);

    long countByStatus(WorkOrderStatus status);
}
