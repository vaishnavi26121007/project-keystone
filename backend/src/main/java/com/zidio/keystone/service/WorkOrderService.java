package com.zidio.keystone.service;

import com.zidio.keystone.dto.*;
import com.zidio.keystone.entity.*;
import com.zidio.keystone.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Core business logic for the work-order lifecycle:
 * NEW -> ASSIGNED -> IN_PROGRESS -> (ON_HOLD <-> IN_PROGRESS) -> COMPLETED -> CLOSED
 * Any non-terminal state may transition to CANCELLED.
 */
@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final ClientRepository clientRepository;
    private final SiteRepository siteRepository;
    private final AssetRepository assetRepository;
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final PartRepository partRepository;
    private final WorkOrderPartRepository workOrderPartRepository;
    private final TimeLogRepository timeLogRepository;
    private final WorkOrderNoteRepository noteRepository;

    @Transactional
    public WorkOrderResponse create(WorkOrderRequest request, String requesterEmail) {
        User creator = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Resolve which client this work order belongs to:
        // - CLIENT-role users always get their own linked organization (request.clientId is ignored/optional)
        // - ADMIN/DISPATCHER must supply clientId explicitly
        Long resolvedClientId;
        if (creator.getRole() == Role.CLIENT) {
            if (creator.getClient() == null) {
                throw new IllegalStateException("Your account is not linked to a client organization");
            }
            resolvedClientId = creator.getClient().getId();
        } else {
            if (request.getClientId() == null) {
                throw new IllegalStateException("clientId is required");
            }
            resolvedClientId = request.getClientId();
        }

        Client client = clientRepository.findById(resolvedClientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new EntityNotFoundException("Site not found"));

        // Guard against a client requesting work for a site that isn't theirs
        if (creator.getRole() == Role.CLIENT && !site.getClient().getId().equals(resolvedClientId)) {
            throw new IllegalStateException("Selected site does not belong to your organization");
        }

        Asset asset = null;
        if (request.getAssetId() != null) {
            asset = assetRepository.findById(request.getAssetId())
                    .orElseThrow(() -> new EntityNotFoundException("Asset not found"));
        }

        Priority priority = request.getPriority() != null ? request.getPriority() : Priority.MEDIUM;

        WorkOrder workOrder = WorkOrder.builder()
                .ticketNumber(generateTicketNumber())
                .title(request.getTitle())
                .description(request.getDescription())
                .client(client)
                .site(site)
                .asset(asset)
                .createdBy(creator)
                .priority(priority)
                .status(WorkOrderStatus.NEW)
                .slaDueAt(LocalDateTime.now().plusHours(priority.getSlaHours()))
                .build();

        workOrder = workOrderRepository.save(workOrder);
        return toResponse(workOrder);
    }

    @Transactional
    public WorkOrderResponse assignTechnician(Long workOrderId, Long technicianId) {
        WorkOrder wo = getOrThrow(workOrderId);
        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found"));

        if (wo.getStatus() == WorkOrderStatus.CLOSED || wo.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot assign a technician to a " + wo.getStatus() + " work order");
        }

        wo.setAssignedTechnician(tech);
        wo.setStatus(WorkOrderStatus.ASSIGNED);
        wo.setAssignedAt(LocalDateTime.now());
        tech.setAvailability(Technician.AvailabilityStatus.ON_JOB);
        technicianRepository.save(tech);

        return toResponse(workOrderRepository.save(wo));
    }

    @Transactional
    public WorkOrderResponse updateStatus(Long workOrderId, StatusUpdateRequest request, String requesterEmail) {
        WorkOrder wo = getOrThrow(workOrderId);
        WorkOrderStatus current = wo.getStatus();
        WorkOrderStatus target = request.getStatus();

        validateTransition(current, target);

        wo.setStatus(target);
        LocalDateTime now = LocalDateTime.now();

        switch (target) {
            case IN_PROGRESS -> { if (wo.getStartedAt() == null) wo.setStartedAt(now); }
            case COMPLETED -> {
                wo.setCompletedAt(now);
                if (wo.getAssignedTechnician() != null) {
                    wo.getAssignedTechnician().setAvailability(Technician.AvailabilityStatus.AVAILABLE);
                    technicianRepository.save(wo.getAssignedTechnician());
                }
            }
            case CLOSED -> wo.setClosedAt(now);
            case CANCELLED -> {
                if (wo.getAssignedTechnician() != null) {
                    wo.getAssignedTechnician().setAvailability(Technician.AvailabilityStatus.AVAILABLE);
                    technicianRepository.save(wo.getAssignedTechnician());
                }
            }
            default -> { /* no side effect */ }
        }

        if (now.isAfter(wo.getSlaDueAt()) && target != WorkOrderStatus.CANCELLED) {
            wo.setSlaBreached(true);
        }

        wo = workOrderRepository.save(wo);

        if (request.getNote() != null && !request.getNote().isBlank()) {
            User author = userRepository.findByEmail(requesterEmail).orElse(null);
            if (author != null) {
                WorkOrderNote note = WorkOrderNote.builder()
                        .workOrder(wo)
                        .author(author)
                        .content("[Status -> " + target + "] " + request.getNote())
                        .build();
                noteRepository.save(note);
            }
        }

        return toResponse(wo);
    }

    private void validateTransition(WorkOrderStatus from, WorkOrderStatus to) {
        if (from == to) return;
        boolean valid = switch (from) {
            case NEW -> to == WorkOrderStatus.ASSIGNED || to == WorkOrderStatus.CANCELLED;
            case ASSIGNED -> to == WorkOrderStatus.IN_PROGRESS || to == WorkOrderStatus.CANCELLED;
            case IN_PROGRESS -> to == WorkOrderStatus.ON_HOLD || to == WorkOrderStatus.COMPLETED || to == WorkOrderStatus.CANCELLED;
            case ON_HOLD -> to == WorkOrderStatus.IN_PROGRESS || to == WorkOrderStatus.CANCELLED;
            case COMPLETED -> to == WorkOrderStatus.CLOSED;
            case CLOSED, CANCELLED -> false;
        };
        if (!valid) {
            throw new IllegalStateException("Invalid status transition: " + from + " -> " + to);
        }
    }

    @Transactional
    public void addPart(Long workOrderId, AddPartRequest request) {
        WorkOrder wo = getOrThrow(workOrderId);
        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new EntityNotFoundException("Part not found"));

        if (part.getQuantityInStock() < request.getQuantity()) {
            throw new IllegalStateException("Insufficient stock for part: " + part.getName());
        }

        WorkOrderPart wop = WorkOrderPart.builder()
                .workOrder(wo)
                .part(part)
                .quantityUsed(request.getQuantity())
                .unitCostAtUse(part.getUnitCost())
                .build();
        workOrderPartRepository.save(wop);

        part.setQuantityInStock(part.getQuantityInStock() - request.getQuantity());
        partRepository.save(part);
    }

    @Transactional
    public void startTimer(Long workOrderId, Long technicianId, TimeLogRequest request) {
        WorkOrder wo = getOrThrow(workOrderId);
        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found"));

        TimeLog log = TimeLog.builder()
                .workOrder(wo)
                .technician(tech)
                .startTime(LocalDateTime.now())
                .workDescription(request.getWorkDescription())
                .build();
        timeLogRepository.save(log);
    }

    @Transactional
    public void stopTimer(Long timeLogId) {
        TimeLog log = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new EntityNotFoundException("Time log not found"));
        if (log.getEndTime() != null) {
            throw new IllegalStateException("Timer already stopped");
        }
        LocalDateTime end = LocalDateTime.now();
        log.setEndTime(end);
        log.setDurationMinutes((double) Duration.between(log.getStartTime(), end).toMinutes());
        timeLogRepository.save(log);
    }

    public List<TimeLogResponse> getTimeLogs(Long workOrderId) {
        return timeLogRepository.findByWorkOrderId(workOrderId).stream()
                .map(this::toTimeLogResponse)
                .collect(Collectors.toList());
    }

    public TimeLogResponse getActiveTimer(Long workOrderId, Long technicianId) {
        return timeLogRepository.findByWorkOrderIdAndTechnicianIdAndEndTimeIsNull(workOrderId, technicianId)
                .map(this::toTimeLogResponse)
                .orElse(null);
    }

    private TimeLogResponse toTimeLogResponse(TimeLog log) {
        return TimeLogResponse.builder()
                .id(log.getId())
                .technicianId(log.getTechnician().getId())
                .technicianName(log.getTechnician().getUser().getFullName())
                .startTime(log.getStartTime())
                .endTime(log.getEndTime())
                .durationMinutes(log.getDurationMinutes())
                .workDescription(log.getWorkDescription())
                .running(log.getEndTime() == null)
                .build();
    }

    public List<WorkOrderPartResponse> getPartsUsed(Long workOrderId) {
        return workOrderPartRepository.findByWorkOrderId(workOrderId).stream()
                .map(wop -> WorkOrderPartResponse.builder()
                        .id(wop.getId())
                        .partId(wop.getPart().getId())
                        .partName(wop.getPart().getName())
                        .quantityUsed(wop.getQuantityUsed())
                        .unitCostAtUse(wop.getUnitCostAtUse())
                        .lineTotal(wop.getUnitCostAtUse().multiply(java.math.BigDecimal.valueOf(wop.getQuantityUsed())))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addNote(Long workOrderId, NoteRequest request, String requesterEmail) {
        WorkOrder wo = getOrThrow(workOrderId);
        User author = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        WorkOrderNote note = WorkOrderNote.builder()
                .workOrder(wo)
                .author(author)
                .content(request.getContent())
                .build();
        noteRepository.save(note);
    }

    public WorkOrderResponse getById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public List<WorkOrderResponse> getAll() {
        return workOrderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Role-aware listing used by the general "/work-orders" list endpoint:
     * - ADMIN / DISPATCHER see everything
     * - CLIENT sees only work orders belonging to their own client organization
     * - TECHNICIAN sees only work orders assigned to them
     */
    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getAllForUser(String requesterEmail) {
        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return switch (user.getRole()) {
            case ADMIN, DISPATCHER -> getAll();
            case CLIENT -> {
                if (user.getClient() == null) {
                    yield List.of();
                }
                yield getByClient(user.getClient().getId());
            }
            case TECHNICIAN -> {
                Technician tech = technicianRepository.findByUserId(user.getId()).orElse(null);
                if (tech == null) {
                    yield List.of();
                }
                yield getByTechnician(tech.getId());
            }
        };
    }

    public List<WorkOrderResponse> getByClient(Long clientId) {
        return workOrderRepository.findByClientId(clientId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Same as getByClient, but if the requester is a CLIENT-role user, enforces that
     * they can only fetch their own organization's work orders (prevents a client from
     * reading another company's data by guessing IDs).
     */
    public List<WorkOrderResponse> getByClientForUser(Long clientId, String requesterEmail) {
        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getRole() == Role.CLIENT) {
            if (user.getClient() == null || !user.getClient().getId().equals(clientId)) {
                throw new IllegalStateException("You do not have access to this client's work orders");
            }
        }
        return getByClient(clientId);
    }

    public List<WorkOrderResponse> getByTechnician(Long technicianId) {
        return workOrderRepository.findByAssignedTechnicianId(technicianId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<WorkOrderResponse> getOverdue() {
        return workOrderRepository.findOverdue(LocalDateTime.now()).stream().map(this::toResponse).collect(Collectors.toList());
    }

    private WorkOrder getOrThrow(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Work order not found: " + id));
    }

    private String generateTicketNumber() {
        int year = LocalDateTime.now().getYear();
        long count = workOrderRepository.count() + 1;
        return String.format("WO-%d-%05d", year, count);
    }

    private WorkOrderResponse toResponse(WorkOrder wo) {
        return WorkOrderResponse.builder()
                .id(wo.getId())
                .ticketNumber(wo.getTicketNumber())
                .title(wo.getTitle())
                .description(wo.getDescription())
                .clientName(wo.getClient() != null ? wo.getClient().getCompanyName() : null)
                .siteName(wo.getSite() != null ? wo.getSite().getName() : null)
                .assetName(wo.getAsset() != null ? wo.getAsset().getName() : null)
                .technicianName(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getUser().getFullName() : null)
                .status(wo.getStatus())
                .priority(wo.getPriority())
                .createdAt(wo.getCreatedAt())
                .slaDueAt(wo.getSlaDueAt())
                .slaBreached(wo.isSlaBreached())
                .completedAt(wo.getCompletedAt())
                .build();
    }
}
