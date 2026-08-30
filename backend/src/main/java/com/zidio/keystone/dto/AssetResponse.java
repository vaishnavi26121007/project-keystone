package com.zidio.keystone.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssetResponse {

    private Long id;
    private String name;
    private String assetTag;
    private String category;
    private String manufacturer;
    private String modelNumber;
    private String serialNumber;
    private Long siteId;
    private String siteName;
}