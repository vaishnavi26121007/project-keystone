package com.zidio.keystone.repository;

import com.zidio.keystone.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    @Query("""
        SELECT a
        FROM Asset a
        JOIN FETCH a.site
        WHERE a.site.id = :siteId
    """)
    List<Asset> findBySiteId(Long siteId);
}