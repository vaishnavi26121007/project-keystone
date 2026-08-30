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

    @Query("""
        SELECT DISTINCT w
        FROM WorkOrder w
        LEFT JOIN FETCH w.client
        LEFT JOIN FETCH w.site
        LEFT JOIN FETCH w.asset
        LEFT JOIN FETCH w.assignedTechnician t
        LEFT JOIN FETCH t.user
        LEFT JOIN FETCH w.createdBy
        WHERE w.id = :id
    """)
    WorkOrder findByIdWithDetails(@Param("id") Long id);

    @Query("""
        SELECT w
        FROM WorkOrder w
        WHERE w.status NOT IN ('CLOSED','CANCELLED','COMPLETED')
        AND w.slaDueAt < :now
    """)
    List<WorkOrder> findOverdue(@Param("now") LocalDateTime now);

    long countByStatus(WorkOrderStatus status);
}