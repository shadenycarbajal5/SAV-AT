package com.epiis.savat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityCaja;

@Repository
public interface RepositoryCaja extends JpaRepository<EntityCaja, Integer> {

	@Query("SELECT c FROM EntityCaja c WHERE c.fechaCierre IS NULL")
	Optional<EntityCaja> findCajaAbierta();
}
