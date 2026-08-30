package com.zidio.keystone.controller;

import com.zidio.keystone.dto.TechnicianResponse;
import com.zidio.keystone.entity.Technician;
import com.zidio.keystone.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<List<TechnicianResponse>> getAll() {
        return ResponseEntity.ok(technicianService.getAll());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<List<TechnicianResponse>> getAvailable() {
        return ResponseEntity.ok(technicianService.getAvailable());
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<TechnicianResponse> getByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                technicianService.getByUserId(userId)
        );
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<TechnicianResponse> updateAvailability(
            @PathVariable Long id,
            @RequestParam Technician.AvailabilityStatus status) {

        return ResponseEntity.ok(
                technicianService.updateAvailability(id, status)
        );
    }
}