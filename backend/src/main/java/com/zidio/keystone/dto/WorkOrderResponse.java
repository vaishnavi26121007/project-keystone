package com.zidio.keystone.dto;

import com.zidio.keystone.entity.Priority;
import com.zidio.keystone.entity.WorkOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WorkOrderResponse {
    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private String clientName;
    private String siteName;
    private String assetName;
    private String technicianName;
    private WorkOrderStatus status;
    private Priority priority;
    private LocalDateTime createdAt;
    private LocalDateTime slaDueAt;
    private boolean slaBreached;
    private LocalDateTime completedAt;
}
