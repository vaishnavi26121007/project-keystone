package com.zidio.keystone.controller;

import com.zidio.keystone.entity.Client;
import com.zidio.keystone.entity.Site;
import com.zidio.keystone.repository.ClientRepository;
import com.zidio.keystone.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteRepository siteRepository;
    private final ClientRepository clientRepository;

    @GetMapping
    public ResponseEntity<List<Site>> getAll() {
        return ResponseEntity.ok(siteRepository.findAll());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Site>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(siteRepository.findByClientId(clientId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Site> create(@RequestBody Site site) {
        Client client = clientRepository.findById(site.getClient().getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        site.setClient(client);
        return ResponseEntity.ok(siteRepository.save(site));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        siteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
