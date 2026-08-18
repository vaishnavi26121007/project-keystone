package com.zidio.keystone.repository;

import com.zidio.keystone.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findBySiteId(Long siteId);
}
