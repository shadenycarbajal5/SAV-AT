package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityDetalleVenta;

@Repository
public interface RepositoryDetalleVenta extends JpaRepository<EntityDetalleVenta, Integer> {

	@Query("SELECT d FROM EntityDetalleVenta d LEFT JOIN FETCH d.producto WHERE d.venta.idVenta = :idVenta")
	List<EntityDetalleVenta> findByVenta(Integer idVenta);
}
