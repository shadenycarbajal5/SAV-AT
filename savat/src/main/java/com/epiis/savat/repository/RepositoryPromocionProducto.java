package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.epiis.savat.entity.EntityPromocionProducto;
import com.epiis.savat.entity.EntityPromocionProducto.PromocionProductoId;

@Repository
public interface RepositoryPromocionProducto extends JpaRepository<EntityPromocionProducto, PromocionProductoId> {

	@Query("SELECT pp FROM EntityPromocionProducto pp LEFT JOIN FETCH pp.producto WHERE pp.promocion.idPromocion = :idPromocion")
	List<EntityPromocionProducto> findByPromocion(Integer idPromocion);

	@Modifying
	@Transactional
	@Query("DELETE FROM EntityPromocionProducto pp WHERE pp.promocion.idPromocion = :idPromocion")
	void deleteByPromocion(Integer idPromocion);
}
