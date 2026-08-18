package com.zidio.keystone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "technicians")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column
    private String specialization; // e.g. HVAC, Electrical, General Maintenance

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private AvailabilityStatus availability = AvailabilityStatus.AVAILABLE;

    @Column
    private String skillTags; // comma-separated skills for simple matching, e.g. "hvac,electrical"

    public enum AvailabilityStatus {
        AVAILABLE, ON_JOB, OFF_DUTY
    }
}
