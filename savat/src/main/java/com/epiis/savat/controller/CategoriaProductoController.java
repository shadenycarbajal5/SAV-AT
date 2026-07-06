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

import com.epiis.savat.business.BusinessCategoriaProducto;
import com.epiis.savat.dto.request.RequestCategoriaProducto;
import com.epiis.savat.dto.response.ResponseCategoriaProductoGetAll;
import com.epiis.savat.dto.response.ResponseCategoriaProductoInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "categoriaproducto")
public class CategoriaProductoController {

    private final BusinessCategoriaProducto businessCategoriaProducto;

    public CategoriaProductoController(BusinessCategoriaProducto businessCategoriaProducto) {
        this.businessCategoriaProducto = businessCategoriaProducto;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR','TECNICO')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponseCategoriaProductoGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessCategoriaProducto.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping(path = "insert")
    public ResponseEntity<ResponseCategoriaProductoInsert> actionInsert(
            @Valid @RequestBody RequestCategoriaProducto request,
            BindingResult bindingResult) {
        try {
            ResponseCategoriaProductoInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseCategoriaProductoInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCategoriaProducto.insert(request);
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
            @Valid @RequestBody RequestCategoriaProducto request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCategoriaProducto.update(id, request);
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
            return ResponseEntity.ok(businessCategoriaProducto.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
