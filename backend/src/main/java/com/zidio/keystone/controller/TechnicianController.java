package com.zidio.keystone.controller;

import com.zidio.keystone.entity.Technician;
import com.zidio.keystone.repository.TechnicianRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianRepository technicianRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<List<Technician>> getAll() {
        return ResponseEntity.ok(technicianRepository.findAll());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<List<Technician>> getAvailable() {
        return ResponseEntity.ok(technicianRepository.findByAvailability(Technician.AvailabilityStatus.AVAILABLE));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<Technician> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(technicianRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Technician profile not found")));
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<Technician> updateAvailability(@PathVariable Long id, @RequestParam Technician.AvailabilityStatus status) {
        Technician tech = technicianRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found"));
        tech.setAvailability(status);
        return ResponseEntity.ok(technicianRepository.save(tech));
    }
}
