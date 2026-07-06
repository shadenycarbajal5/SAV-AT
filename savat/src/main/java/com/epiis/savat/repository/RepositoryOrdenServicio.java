package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityOrdenServicio;

@Repository
public interface RepositoryOrdenServicio extends JpaRepository<EntityOrdenServicio, Integer> {

	@Query("SELECT o FROM EntityOrdenServicio o LEFT JOIN FETCH o.cliente LEFT JOIN FETCH o.usuario LEFT JOIN FETCH o.equipo ORDER BY o.fechaIngreso DESC")
	List<EntityOrdenServicio> findAllWithDetails();
}
