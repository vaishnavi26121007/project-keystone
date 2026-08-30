package com.zidio.keystone.dto;

import com.zidio.keystone.entity.Technician.AvailabilityStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TechnicianResponse {

    private Long id;

    private Long userId;

    private String fullName;

    private String email;

    private String phone;

    private String specialization;

    private AvailabilityStatus availability;

    private String skillTags;
}