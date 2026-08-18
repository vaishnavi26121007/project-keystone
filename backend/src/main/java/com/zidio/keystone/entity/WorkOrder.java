package com.zidio.keystone.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Human-readable ticket number, e.g. WO-2026-00042
    @Column(nullable = false, unique = true)
    private String ticketNumber;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnore
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    @JsonIgnore
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    @JsonIgnore
    private Asset asset;// nullable - some requests aren't tied to a specific asset

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    @JsonIgnore
    private Technician assignedTechnician;// nullable until dispatched

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnore
    private User createdBy; // client user or dispatcher who raised it

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private WorkOrderStatus status = WorkOrderStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime closedAt;

    // SLA due-by timestamp, computed at creation from priority.slaHours
    @Column(nullable = false)
    private LocalDateTime slaDueAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean slaBreached = false;

    @Builder.Default
    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkOrderPart> partsUsed = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimeLog> timeLogs = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkOrderNote> notes = new ArrayList<>();
}
