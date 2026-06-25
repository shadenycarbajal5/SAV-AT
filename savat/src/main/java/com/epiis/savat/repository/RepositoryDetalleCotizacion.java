package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityDetalleCotizacion;

@Repository
public interface RepositoryDetalleCotizacion extends JpaRepository<EntityDetalleCotizacion, Integer> {

	@Query("SELECT d FROM EntityDetalleCotizacion d LEFT JOIN FETCH d.producto WHERE d.cotizacion.idCotizacion = :idCotizacion")
	List<EntityDetalleCotizacion> findByCotizacion(Integer idCotizacion);
}
