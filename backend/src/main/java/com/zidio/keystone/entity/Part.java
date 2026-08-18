package com.zidio.keystone.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String sku;

    @Column(nullable = false)
    private BigDecimal unitCost;

    @Builder.Default
    @Column(nullable = false)
    private Integer quantityInStock = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer reorderThreshold = 5;
}
