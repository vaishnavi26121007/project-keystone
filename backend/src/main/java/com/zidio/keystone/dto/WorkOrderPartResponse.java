package com.zidio.keystone.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class WorkOrderPartResponse {
    private Long id;
    private Long partId;
    private String partName;
    private Integer quantityUsed;
    private BigDecimal unitCostAtUse;
    private BigDecimal lineTotal;
}
