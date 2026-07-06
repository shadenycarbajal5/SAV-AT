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

import com.epiis.savat.business.BusinessProveedor;
import com.epiis.savat.dto.request.RequestProveedor;
import com.epiis.savat.dto.response.ResponseProveedorGetAll;
import com.epiis.savat.dto.response.ResponseProveedorInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "proveedor")
public class ProveedorController {

    private final BusinessProveedor businessProveedor;

    public ProveedorController(BusinessProveedor businessProveedor) {
        this.businessProveedor = businessProveedor;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR','TECNICO')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponseProveedorGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessProveedor.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping(path = "insert")
    public ResponseEntity<ResponseProveedorInsert> actionInsert(
            @Valid @RequestBody RequestProveedor request,
            BindingResult bindingResult) {
        try {
            ResponseProveedorInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseProveedorInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessProveedor.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping(path = "update/{id}")
    public ResponseEntity<ResponseGeneric> actionUpdate(
            @PathVariable Integer id,
            @Valid @RequestBody RequestProveedor request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessProveedor.update(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping(path = "delete/{id}")
    public ResponseEntity<ResponseGeneric> actionDelete(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(businessProveedor.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
