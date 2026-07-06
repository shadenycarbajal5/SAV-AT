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

import com.epiis.savat.business.BusinessPromocion;
import com.epiis.savat.dto.request.RequestPromocion;
import com.epiis.savat.dto.response.ResponsePromocionGetAll;
import com.epiis.savat.dto.response.ResponsePromocionInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "promocion")
public class PromocionController {

    private final BusinessPromocion businessPromocion;

    public PromocionController(BusinessPromocion businessPromocion) {
        this.businessPromocion = businessPromocion;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponsePromocionGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessPromocion.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping(path = "insert")
    public ResponseEntity<ResponsePromocionInsert> actionInsert(
            @Valid @RequestBody RequestPromocion request,
            BindingResult bindingResult) {
        try {
            ResponsePromocionInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponsePromocionInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessPromocion.insert(request);
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
            @Valid @RequestBody RequestPromocion request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessPromocion.update(id, request);
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
            return ResponseEntity.ok(businessPromocion.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
