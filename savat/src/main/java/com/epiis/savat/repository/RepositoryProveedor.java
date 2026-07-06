package com.epiis.savat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityProveedor;

@Repository
public interface RepositoryProveedor extends JpaRepository<EntityProveedor, Integer> {
}
