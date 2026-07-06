package com.epiis.savat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityRol;

@Repository
public interface RepositoryRol extends JpaRepository<EntityRol, Integer> {
}
