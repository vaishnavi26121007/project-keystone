package com.zidio.keystone.service;

import com.zidio.keystone.dto.DashboardStatsResponse;
import com.zidio.keystone.entity.Priority;
import com.zidio.keystone.entity.WorkOrder;
import com.zidio.keystone.entity.WorkOrderStatus;
import com.zidio.keystone.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkOrderRepository workOrderRepository;

    public DashboardStatsResponse getStats() {
        List<WorkOrder> all = workOrderRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long open = all.stream().filter(w -> w.getStatus() == WorkOrderStatus.NEW || w.getStatus() == WorkOrderStatus.ASSIGNED).count();
        long inProgress = all.stream().filter(w -> w.getStatus() == WorkOrderStatus.IN_PROGRESS || w.getStatus() == WorkOrderStatus.ON_HOLD).count();
        long completed = all.stream().filter(w -> w.getStatus() == WorkOrderStatus.COMPLETED).count();
        long closed = all.stream().filter(w -> w.getStatus() == WorkOrderStatus.CLOSED).count();
        long overdue = all.stream().filter(w ->
                w.getStatus() != WorkOrderStatus.CLOSED
                        && w.getStatus() != WorkOrderStatus.CANCELLED
                        && w.getStatus() != WorkOrderStatus.COMPLETED
                        && w.getSlaDueAt().isBefore(now)
        ).count();

        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (Priority p : Priority.values()) {
            byPriority.put(p.name(), all.stream().filter(w -> w.getPriority() == p).count());
        }

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (WorkOrderStatus s : WorkOrderStatus.values()) {
            byStatus.put(s.name(), all.stream().filter(w -> w.getStatus() == s).count());
        }

        return DashboardStatsResponse.builder()
                .totalOpen(open)
                .totalInProgress(inProgress)
                .totalCompleted(completed)
                .totalClosed(closed)
                .totalOverdue(overdue)
                .byPriority(byPriority)
                .byStatus(byStatus)
                .build();
    }
}
