package com.epiis.savat.business;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.epiis.savat.config.JwtService;
import com.epiis.savat.dto.request.RequestUsuarioLogin;
import com.epiis.savat.dto.response.ResponseUsuarioLogin;
import com.epiis.savat.entity.EntityUsuario;
import com.epiis.savat.repository.RepositoryUsuario;

@Service
public class BusinessUsuario {

    private final RepositoryUsuario repositoryUsuario;
    private final PasswordEncoder   passwordEncoder;
    private final JwtService        jwtService;

    public BusinessUsuario(RepositoryUsuario repositoryUsuario, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repositoryUsuario = repositoryUsuario;
        this.passwordEncoder   = passwordEncoder;
        this.jwtService        = jwtService;
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
