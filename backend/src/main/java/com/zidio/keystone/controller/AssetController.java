package com.zidio.keystone.controller;

import com.zidio.keystone.entity.Asset;
import com.zidio.keystone.entity.Site;
import com.zidio.keystone.repository.AssetRepository;
import com.zidio.keystone.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
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
    public ResponseEntity<List<Asset>> getBySite(@PathVariable Long siteId) {
        return ResponseEntity.ok(assetRepository.findBySiteId(siteId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Asset> create(@RequestBody Asset asset) {
        Site site = siteRepository.findById(asset.getSite().getId())
                .orElseThrow(() -> new EntityNotFoundException("Site not found"));
        asset.setSite(site);
        return ResponseEntity.ok(assetRepository.save(asset));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assetRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
