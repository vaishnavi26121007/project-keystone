package com.zidio.keystone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "Rooftop HVAC Unit 3"

    @Column
    private String assetTag; // internal asset code

    @Column
    private String category; // HVAC, Electrical, Plumbing, Elevator, Fire Safety, etc.

    @Column
    private String manufacturer;

    @Column
    private String modelNumber;

    @Column
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;
}
