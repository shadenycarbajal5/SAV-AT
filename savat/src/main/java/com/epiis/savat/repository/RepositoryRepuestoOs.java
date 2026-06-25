package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityRepuestoOs;

@Repository
public interface RepositoryRepuestoOs extends JpaRepository<EntityRepuestoOs, Integer> {

	@Query("SELECT r FROM EntityRepuestoOs r LEFT JOIN FETCH r.producto WHERE r.ordenServicio.idOs = :idOs")
	List<EntityRepuestoOs> findByOrdenServicio(Integer idOs);
}
