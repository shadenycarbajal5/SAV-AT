package com.epiis.savat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityProducto;

@Repository
public interface RepositoryProducto extends JpaRepository<EntityProducto, Integer> {

	@Query("SELECT p FROM EntityProducto p LEFT JOIN FETCH p.categoriaProducto LEFT JOIN FETCH p.proveedor ORDER BY p.nombre ASC")
	List<EntityProducto> findAllWithDetails();

	@Query("SELECT p FROM EntityProducto p WHERE p.stock <= p.stockMinimo")
	List<EntityProducto> findBajoStock();
}
