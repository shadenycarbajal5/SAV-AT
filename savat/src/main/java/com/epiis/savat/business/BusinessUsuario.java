package com.epiis.savat.business;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.epiis.savat.config.JwtService;
import com.epiis.savat.dto.request.RequestUsuarioLogin;
import com.epiis.savat.dto.request.RequestUsuarioRegister;
import com.epiis.savat.dto.response.ResponseUsuarioLogin;
import com.epiis.savat.entity.EntityRol;
import com.epiis.savat.entity.EntityUsuario;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryRol;
import com.epiis.savat.repository.RepositoryUsuario;

@Service
public class BusinessUsuario {

    private final RepositoryUsuario repositoryUsuario;
    private final RepositoryRol     repositoryRol;
    private final PasswordEncoder   passwordEncoder;
    private final JwtService        jwtService;

    public BusinessUsuario(RepositoryUsuario repositoryUsuario, RepositoryRol repositoryRol,
                           PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repositoryUsuario = repositoryUsuario;
        this.repositoryRol     = repositoryRol;
        this.passwordEncoder   = passwordEncoder;
        this.jwtService        = jwtService;
    }

    public ResponseGeneric register(RequestUsuarioRegister request) {
        ResponseGeneric response = new ResponseGeneric();

        if (repositoryUsuario.findByUsername(request.getUsername()).isPresent()) {
            response.listMessage.add("El nombre de usuario ya está en uso.");
            return response;
        }

        Optional<EntityRol> optRol = repositoryRol.findAll().stream()
                .filter(r -> r.getNombre().equalsIgnoreCase(request.getRol()))
                .findFirst();

        if (optRol.isEmpty()) {
            response.listMessage.add("El rol especificado no existe.");
            return response;
        }

        EntityUsuario entity = new EntityUsuario();
        entity.setNombres(request.getNombres());
        entity.setUsername(request.getUsername());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        entity.setRol(optRol.get());
        entity.setEstado(true);
        repositoryUsuario.save(entity);

        response.success();
        response.listMessage.add("Usuario registrado correctamente.");
        return response;
    }

    public ResponseUsuarioLogin login(RequestUsuarioLogin request) {
        ResponseUsuarioLogin response = new ResponseUsuarioLogin();

        Optional<EntityUsuario> optUsuario = repositoryUsuario.findByUsername(request.getUsername());

        if (optUsuario.isEmpty()) {
            response.listMessage.add("Credenciales incorrectas.");
            return response;
        }

        EntityUsuario usuario = optUsuario.get();

        if (Boolean.FALSE.equals(usuario.getEstado())) {
            response.listMessage.add("El usuario se encuentra inactivo.");
            return response;
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            response.listMessage.add("Credenciales incorrectas.");
            return response;
        }

        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : null;

        response.idUsuario = usuario.getIdUsuario();
        response.nombres   = usuario.getNombres();
        response.username  = usuario.getUsername();
        response.rol       = rolNombre;
        response.token     = jwtService.generateToken(usuario.getIdUsuario(), usuario.getUsername(), rolNombre);

        response.success();
        response.listMessage.add("Inicio de sesión correcto.");

        return response;
    }
}
