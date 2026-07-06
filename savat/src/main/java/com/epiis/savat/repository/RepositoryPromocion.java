package com.epiis.savat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityPromocion;

@Repository
public interface RepositoryPromocion extends JpaRepository<EntityPromocion, Integer> {
}
