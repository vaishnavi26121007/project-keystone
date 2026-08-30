package com.zidio.keystone.controller;

import com.zidio.keystone.dto.AssetRequest;
import com.zidio.keystone.dto.AssetResponse;
import com.zidio.keystone.entity.Asset;
import com.zidio.keystone.entity.Site;
import com.zidio.keystone.repository.AssetRepository;
import com.zidio.keystone.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository assetRepository;
    private final SiteRepository siteRepository;

@GetMapping("/site/{siteId}")
public ResponseEntity<List<AssetResponse>> getBySite(
        @PathVariable Long siteId
) {
    List<AssetResponse> assets = assetRepository.findBySiteId(siteId)
            .stream()
            .map(asset -> AssetResponse.builder()
                    .id(asset.getId())
                    .name(asset.getName())
                    .assetTag(asset.getAssetTag())
                    .category(asset.getCategory())
                    .manufacturer(asset.getManufacturer())
                    .modelNumber(asset.getModelNumber())
                    .serialNumber(asset.getSerialNumber())
                    .siteId(asset.getSite().getId())
                    .siteName(asset.getSite().getName())
                    .build())
            .toList();

    return ResponseEntity.ok(assets);
}

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Asset> create(
            @Valid @RequestBody AssetRequest request
    ) {

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Site not found")
                );

        Asset asset = Asset.builder()
                .name(request.getName())
                .assetTag(request.getAssetTag())
                .category(request.getCategory())
                .manufacturer(request.getManufacturer())
                .modelNumber(request.getModelNumber())
                .serialNumber(request.getSerialNumber())
                .site(site)
                .build();

        return ResponseEntity.ok(
                assetRepository.save(asset)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        if (!assetRepository.existsById(id)) {
            throw new EntityNotFoundException("Asset not found");
        }

        assetRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}