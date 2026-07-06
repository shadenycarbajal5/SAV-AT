package com.epiis.savat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.epiis.savat.entity.EntityUsuario;

@Repository
public interface RepositoryUsuario extends JpaRepository<EntityUsuario, Integer> {

	@Query("SELECT u FROM EntityUsuario u LEFT JOIN FETCH u.rol WHERE u.username = :username")
	Optional<EntityUsuario> findByUsername(String username);
}
