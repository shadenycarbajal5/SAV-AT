package com.epiis.savat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityCliente;

@Repository
public interface RepositoryCliente extends JpaRepository<EntityCliente, Integer> {

	Optional<EntityCliente> findByDniRuc(String dniRuc);

	@Query("SELECT c FROM EntityCliente c LEFT JOIN FETCH c.categoriaCliente ORDER BY c.nombres ASC")
	List<EntityCliente> findAllWithDetails();
}
