package com.zidio.keystone.controller;

import com.zidio.keystone.dto.*;
import com.zidio.keystone.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','CLIENT')")
    public ResponseEntity<WorkOrderResponse> create(@Valid @RequestBody WorkOrderRequest request, Authentication auth) {
        return ResponseEntity.ok(workOrderService.create(request, auth.getName()));
    }

    // Role-aware: ADMIN/DISPATCHER get all work orders, CLIENT gets their org's orders,
    // TECHNICIAN gets their assigned orders. See WorkOrderService.getAllForUser.
    @GetMapping
    public ResponseEntity<List<WorkOrderResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(workOrderService.getAllForUser(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getById(id));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','CLIENT')")
    public ResponseEntity<List<WorkOrderResponse>> getByClient(@PathVariable Long clientId, Authentication auth) {
        return ResponseEntity.ok(workOrderService.getByClientForUser(clientId, auth.getName()));
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<List<WorkOrderResponse>> getByTechnician(@PathVariable Long technicianId) {
        return ResponseEntity.ok(workOrderService.getByTechnician(technicianId));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<List<WorkOrderResponse>> getOverdue() {
        return ResponseEntity.ok(workOrderService.getOverdue());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    public ResponseEntity<WorkOrderResponse> assign(@PathVariable Long id, @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(workOrderService.assignTechnician(id, request.getTechnicianId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<WorkOrderResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Authentication auth) {
        return ResponseEntity.ok(workOrderService.updateStatus(id, request, auth.getName()));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<Void> addPart(@PathVariable Long id, @Valid @RequestBody AddPartRequest request) {
        workOrderService.addPart(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/parts")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<List<WorkOrderPartResponse>> getPartsUsed(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getPartsUsed(id));
    }

    @PostMapping("/{id}/timer/start/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<Void> startTimer(@PathVariable Long id, @PathVariable Long technicianId, @RequestBody TimeLogRequest request) {
        workOrderService.startTimer(id, technicianId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/timer/{timeLogId}/stop")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<Void> stopTimer(@PathVariable Long timeLogId) {
        workOrderService.stopTimer(timeLogId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/timelogs")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<List<TimeLogResponse>> getTimeLogs(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getTimeLogs(id));
    }

    @GetMapping("/{id}/timer/active/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<TimeLogResponse> getActiveTimer(@PathVariable Long id, @PathVariable Long technicianId) {
        TimeLogResponse active = workOrderService.getActiveTimer(id, technicianId);
        return active != null ? ResponseEntity.ok(active) : ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<Void> addNote(@PathVariable Long id, @Valid @RequestBody NoteRequest request, Authentication auth) {
        workOrderService.addNote(id, request, auth.getName());
        return ResponseEntity.ok().build();
    }
}
