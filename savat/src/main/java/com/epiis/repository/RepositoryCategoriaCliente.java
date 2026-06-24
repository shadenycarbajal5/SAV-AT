package com.epiis.savat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityCategoriaCliente;

@Repository
public interface RepositoryCategoriaCliente extends JpaRepository<EntityCategoriaCliente, Integer> {
}
