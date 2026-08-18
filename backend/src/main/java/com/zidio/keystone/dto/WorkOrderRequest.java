package com.zidio.keystone.dto;

import com.zidio.keystone.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkOrderRequest {
    @NotBlank
    private String title;

    private String description;

    // Optional: required for ADMIN/DISPATCHER (who pick the client explicitly).
    // For a CLIENT-role requester, the server derives this from their own account,
    // so the frontend omits it and this may be null.
    private Long clientId;

    @NotNull
    private Long siteId;

    private Long assetId;

    private Priority priority;
}
