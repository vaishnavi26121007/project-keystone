package com.zidio.keystone.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Column
    private String contactEmail;

    @Column
    private String contactPhone;

    @Column
    private String billingAddress;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private SlaTier slaTier = SlaTier.STANDARD;

    @Builder.Default
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Site> sites = new ArrayList<>();

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SlaTier {
        STANDARD, PREMIUM, ENTERPRISE
    }
}
