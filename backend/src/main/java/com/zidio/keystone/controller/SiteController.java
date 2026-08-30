package com.zidio.keystone.controller;

import com.zidio.keystone.dto.SiteRequest;
import com.zidio.keystone.entity.Site;
import com.zidio.keystone.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    public ResponseEntity<List<Site>> getAll(Authentication auth) {
        return ResponseEntity.ok(siteService.getAllForUser(auth.getName()));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Site>> getByClient(
            @PathVariable Long clientId,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                siteService.getByClientForUser(clientId, auth.getName())
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','CLIENT')")
    public ResponseEntity<Site> create(
            @Valid @RequestBody SiteRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                siteService.create(request, auth.getName())
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}