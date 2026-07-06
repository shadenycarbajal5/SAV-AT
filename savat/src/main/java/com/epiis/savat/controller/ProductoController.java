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

import com.epiis.savat.business.BusinessProducto;
import com.epiis.savat.dto.request.RequestProducto;
import com.epiis.savat.dto.response.ResponseProductoGetAll;
import com.epiis.savat.dto.response.ResponseProductoInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "producto")
public class ProductoController {

    private final BusinessProducto businessProducto;

    public ProductoController(BusinessProducto businessProducto) {
        this.businessProducto = businessProducto;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR','TECNICO')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponseProductoGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessProducto.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping(path = "insert")
    public ResponseEntity<ResponseProductoInsert> actionInsert(
            @Valid @RequestBody RequestProducto request,
            BindingResult bindingResult) {
        try {
            ResponseProductoInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseProductoInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessProducto.insert(request);
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
            @Valid @RequestBody RequestProducto request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessProducto.update(id, request);
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
            return ResponseEntity.ok(businessProducto.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
