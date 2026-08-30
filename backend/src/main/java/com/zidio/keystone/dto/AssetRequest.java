package com.zidio.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssetRequest {

    @NotBlank
    private String name;

    private String assetTag;

    private String category;

    private String manufacturer;

    private String modelNumber;

    private String serialNumber;

    @NotNull
    private Long siteId;
}