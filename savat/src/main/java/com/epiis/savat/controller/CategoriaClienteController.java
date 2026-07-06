package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessCategoriaCliente;
import com.epiis.savat.dto.request.RequestCategoriaCliente;
import com.epiis.savat.dto.response.ResponseCategoriaClienteGetAll;
import com.epiis.savat.dto.response.ResponseCategoriaClienteInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "categoriacliente")
public class CategoriaClienteController {

    private final BusinessCategoriaCliente businessCategoriaCliente;

    public CategoriaClienteController(BusinessCategoriaCliente businessCategoriaCliente) {
        this.businessCategoriaCliente = businessCategoriaCliente;
    }

    @GetMapping(path = "getall")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR','TECNICO')")
    public ResponseEntity<ResponseCategoriaClienteGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessCategoriaCliente.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(path = "insert")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ResponseCategoriaClienteInsert> actionInsert(
            @Valid @RequestBody RequestCategoriaCliente request,
            BindingResult bindingResult) {
        try {
            ResponseCategoriaClienteInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseCategoriaClienteInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCategoriaCliente.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping(path = "update/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ResponseGeneric> actionUpdate(
            @PathVariable Integer id,
            @Valid @RequestBody RequestCategoriaCliente request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCategoriaCliente.update(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping(path = "delete/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ResponseGeneric> actionDelete(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(businessCategoriaCliente.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
