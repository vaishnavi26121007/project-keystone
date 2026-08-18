package com.zidio.keystone.controller;

import com.zidio.keystone.entity.Part;
import com.zidio.keystone.repository.PartRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartRepository partRepository;

    @GetMapping
    public ResponseEntity<List<Part>> getAll() {
        return ResponseEntity.ok(partRepository.findAll());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<List<Part>> getLowStock() {
        return ResponseEntity.ok(partRepository.findAll().stream()
                .filter(p -> p.getQuantityInStock() <= p.getReorderThreshold())
                .collect(Collectors.toList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Part> create(@RequestBody Part part) {
        return ResponseEntity.ok(partRepository.save(part));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Part> update(@PathVariable Long id, @RequestBody Part updated) {
        Part existing = partRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Part not found"));
        existing.setName(updated.getName());
        existing.setSku(updated.getSku());
        existing.setUnitCost(updated.getUnitCost());
        existing.setQuantityInStock(updated.getQuantityInStock());
        existing.setReorderThreshold(updated.getReorderThreshold());
        return ResponseEntity.ok(partRepository.save(existing));
    }
}
