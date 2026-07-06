package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessUsuario;
import com.epiis.savat.dto.request.RequestUsuarioLogin;
import com.epiis.savat.dto.request.RequestUsuarioRegister;
import com.epiis.savat.dto.response.ResponseUsuarioLogin;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "usuario")
public class UsuarioController {

    private final BusinessUsuario businessUsuario;

    public UsuarioController(BusinessUsuario businessUsuario) {
        this.businessUsuario = businessUsuario;
    }

    @PostMapping(path = "login")
    public ResponseEntity<ResponseUsuarioLogin> actionLogin(
            @Valid @RequestBody RequestUsuarioLogin request,
            BindingResult bindingResult) {

        try {
            ResponseUsuarioLogin response;

            if (bindingResult.hasErrors()) {
                response = new ResponseUsuarioLogin();
                bindingResult.getAllErrors().forEach(error ->
                    response.listMessage.add(error.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessUsuario.login(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(path = "register")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ResponseGeneric> actionRegister(
            @Valid @RequestBody RequestUsuarioRegister request,
            BindingResult bindingResult) {

        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(error ->
                    response.listMessage.add(error.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessUsuario.register(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
