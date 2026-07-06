package com.epiis.savat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityCategoriaProducto;

@Repository
public interface RepositoryCategoriaProducto extends JpaRepository<EntityCategoriaProducto, Integer> {
}
