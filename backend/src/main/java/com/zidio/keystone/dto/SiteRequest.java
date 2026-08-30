package com.zidio.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SiteRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String address;

    private String city;

    private String state;

    private String postalCode;

    // Required for ADMIN/DISPATCHER.
    // Ignored for CLIENT.
    private Long clientId;
}