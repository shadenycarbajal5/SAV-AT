package com.epiis.savat;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;

import com.epiis.savat.entity.Usuario; 
import com.epiis.savat.entity.Rol; 
import com.epiis.savat.repository.UsuarioRepository; 
import com.epiis.savat.repository.RolRepository; 

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Crear los Roles si no existen en Postgres
        Rol adminRol = checkAndCreateRol("ADMINISTRADOR");
        Rol vendedorRol = checkAndCreateRol("VENDEDOR");
        Rol tecnicoRol = checkAndCreateRol("TECNICO");

        // 2. Insertar Administrador del Sistema
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = new Usuario();
            admin.setNombres("Administrador del Sistema");
            admin.setUsername("admin");
            admin.setPassword("$2b$10$fUIrgn8RtXctx0zvYo/nRumoEVlq9D.cyKEfGbuM5kZvuohTjviqq"); 
            admin.setEstado(true);
            admin.setIdRol(adminRol); // Si tu entidad usa setRol(adminRol) cámbialo aquí
            usuarioRepository.save(admin);
        }

        // 3. Insertar Vendedor de Prueba
        if (!usuarioRepository.existsByUsername("vendedor1")) {
            Usuario vendedor = new Usuario();
            vendedor.setNombres("Vendedor de Prueba");
            vendedor.setUsername("vendedor1");
            vendedor.setPassword("$2b$10$kTCVA/z9YPTyDpNNr5p8Ye1Sruzh0AmVJkNbtRq0rTv8Lmz2D1WcW");
            vendedor.setEstado(true);
            vendedor.setIdRol(vendedorRol); // Si tu entidad usa setRol(vendedorRol) cámbialo aquí
            usuarioRepository.save(vendedor);
        }

        // 4. Insertar Técnico de Prueba
        if (!usuarioRepository.existsByUsername("tecnico1")) {
            Usuario tecnico = new Usuario();
            tecnico.setNombres("Tecnico de Prueba");
            tecnico.setUsername("tecnico1");
            tecnico.setPassword("$2b$10$ixoFF/wC1LcAes/kvSCnnOw7wsJc2lhO2uhnzyq9fDuLSEIxu52QG");
            tecnico.setEstado(true);
            tecnico.setIdRol(tecnicoRol); // Si tu entidad usa setRol(tecnicoRol) cámbialo aquí
            usuarioRepository.save(tecnico);
        }
        
        System.out.println("✅ ¡Seeder ejecutado: Usuarios de prueba cargados correctamente!");
    }

    private Rol checkAndCreateRol(String nombreRol) {
        Optional<Rol> rolOpt = rolRepository.findByNombre(nombreRol);
        if (rolOpt.isPresent()) {
            return rolOpt.get();
        } else {
            Rol nuevoRol = new Rol();
            nuevoRol.setNombre(nombreRol);
            return rolRepository.save(nuevoRol);
        }
    }
}
