package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityCotizacion;

@Repository
public interface RepositoryCotizacion extends JpaRepository<EntityCotizacion, Integer> {

	@Query("SELECT c FROM EntityCotizacion c LEFT JOIN FETCH c.cliente ORDER BY c.fecha DESC")
	List<EntityCotizacion> findAllWithDetails();
}
