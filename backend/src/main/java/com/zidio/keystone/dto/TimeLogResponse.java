package com.zidio.keystone.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TimeLogResponse {
    private Long id;
    private Long technicianId;
    private String technicianName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double durationMinutes;
    private String workDescription;
    private boolean running;
}
