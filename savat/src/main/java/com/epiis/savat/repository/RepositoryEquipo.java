package com.epiis.savat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityEquipo;

@Repository
public interface RepositoryEquipo extends JpaRepository<EntityEquipo, Integer> {
}
