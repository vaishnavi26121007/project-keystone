package com.zidio.keystone.dto;

import com.zidio.keystone.entity.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull
    private WorkOrderStatus status;
    private String note;
}
