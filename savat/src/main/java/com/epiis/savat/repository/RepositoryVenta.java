package com.epiis.savat.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityVenta;

@Repository
public interface RepositoryVenta extends JpaRepository<EntityVenta, Integer> {

	@Query("SELECT v FROM EntityVenta v LEFT JOIN FETCH v.cliente LEFT JOIN FETCH v.usuario ORDER BY v.fecha DESC")
	List<EntityVenta> findAllWithDetails();

	@Query("SELECT v FROM EntityVenta v WHERE v.fecha >= :start AND v.fecha < :end")
	List<EntityVenta> findByFechaBetween(LocalDateTime start, LocalDateTime end);
}
