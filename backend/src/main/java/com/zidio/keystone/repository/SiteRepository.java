package com.zidio.keystone.repository;

import com.zidio.keystone.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByClientId(Long clientId);
}
