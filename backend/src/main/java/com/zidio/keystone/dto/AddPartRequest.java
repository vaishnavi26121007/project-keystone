package com.zidio.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddPartRequest {
    @NotNull
    private Long partId;

    @Min(1)
    private Integer quantity;
}
