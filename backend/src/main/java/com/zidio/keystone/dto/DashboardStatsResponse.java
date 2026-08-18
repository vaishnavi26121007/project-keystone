package com.zidio.keystone.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalOpen;
    private long totalInProgress;
    private long totalCompleted;
    private long totalOverdue;
    private long totalClosed;
    private Map<String, Long> byPriority;
    private Map<String, Long> byStatus;
}
