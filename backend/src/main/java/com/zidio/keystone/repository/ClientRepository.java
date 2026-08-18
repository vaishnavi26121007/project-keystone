package com.zidio.keystone.repository;

import com.zidio.keystone.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
