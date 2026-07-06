package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityMovimientoCaja;

@Repository
public interface RepositoryMovimientoCaja extends JpaRepository<EntityMovimientoCaja, Integer> {

	@Query("SELECT m FROM EntityMovimientoCaja m WHERE m.caja.idCaja = :idCaja ORDER BY m.fecha DESC")
	List<EntityMovimientoCaja> findByCaja(Integer idCaja);
}
