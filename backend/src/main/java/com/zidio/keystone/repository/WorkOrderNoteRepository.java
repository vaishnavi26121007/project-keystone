package com.zidio.keystone.repository;

import com.zidio.keystone.entity.WorkOrderNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderNoteRepository extends JpaRepository<WorkOrderNote, Long> {
    List<WorkOrderNote> findByWorkOrderIdOrderByCreatedAtAsc(Long workOrderId);
}
