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

import com.epiis.savat.business.BusinessCliente;
import com.epiis.savat.dto.request.RequestCliente;
import com.epiis.savat.dto.response.ResponseClienteGetAll;
import com.epiis.savat.dto.response.ResponseClienteInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "cliente")
public class ClienteController {

    private final BusinessCliente businessCliente;

    public ClienteController(BusinessCliente businessCliente) {
        this.businessCliente = businessCliente;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR','TECNICO')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponseClienteGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessCliente.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    @PostMapping(path = "insert")
    public ResponseEntity<ResponseClienteInsert> actionInsert(
            @Valid @RequestBody RequestCliente request,
            BindingResult bindingResult) {
        try {
            ResponseClienteInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseClienteInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCliente.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    @PutMapping(path = "update/{id}")
    public ResponseEntity<ResponseGeneric> actionUpdate(
            @PathVariable Integer id,
            @Valid @RequestBody RequestCliente request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCliente.update(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    @DeleteMapping(path = "delete/{id}")
    public ResponseEntity<ResponseGeneric> actionDelete(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(businessCliente.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
