package com.epiis.savat.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.epiis.savat.entity.EntityRol;
import com.epiis.savat.entity.EntityUsuario;
import com.epiis.savat.repository.RepositoryRol;
import com.epiis.savat.repository.RepositoryUsuario;

/**
 * Crea los 3 roles del sistema (ADMINISTRADOR, VENDEDOR, TECNICO) y un
 * usuario de prueba por cada uno, en el primer arranque.
 *
 * Usuarios de prueba:
 *   admin     / admin123     -> ADMINISTRADOR
 *   vendedor1 / vendedor123  -> VENDEDOR
 *   tecnico1  / tecnico123   -> TECNICO
 */
@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(RepositoryRol repositoryRol,
                                       RepositoryUsuario repositoryUsuario,
                                       PasswordEncoder passwordEncoder) {
        return args -> {

            EntityRol rolAdmin    = obtenerOCrearRol(repositoryRol, "ADMINISTRADOR");
            EntityRol rolVendedor = obtenerOCrearRol(repositoryRol, "VENDEDOR");
            EntityRol rolTecnico  = obtenerOCrearRol(repositoryRol, "TECNICO");

            crearUsuarioSiNoExiste(repositoryUsuario, passwordEncoder,
                    "admin", "admin123", "Administrador del Sistema", rolAdmin);

            crearUsuarioSiNoExiste(repositoryUsuario, passwordEncoder,
                    "vendedor1", "vendedor123", "Vendedor de Prueba", rolVendedor);

            crearUsuarioSiNoExiste(repositoryUsuario, passwordEncoder,
                    "tecnico1", "tecnico123", "Técnico de Prueba", rolTecnico);
        };
    }

    private EntityRol obtenerOCrearRol(RepositoryRol repositoryRol, String nombre) {
        return repositoryRol.findAll().stream()
                .filter(r -> nombre.equalsIgnoreCase(r.getNombre()))
                .findFirst()
                .orElseGet(() -> {
                    EntityRol r = new EntityRol();
                    r.setNombre(nombre);
                    return repositoryRol.save(r);
                });
    }

    private void crearUsuarioSiNoExiste(RepositoryUsuario repositoryUsuario,
                                         PasswordEncoder passwordEncoder,
                                         String username, String password,
                                         String nombres, EntityRol rol) {
        if (repositoryUsuario.findByUsername(username).isPresent()) {
            return;
        }
        EntityUsuario usuario = new EntityUsuario();
        usuario.setNombres(nombres);
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setEstado(true);
        usuario.setRol(rol);
        repositoryUsuario.save(usuario);
    }
}
