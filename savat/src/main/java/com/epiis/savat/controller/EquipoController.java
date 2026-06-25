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

import com.epiis.savat.business.BusinessEquipo;
import com.epiis.savat.dto.request.RequestEquipo;
import com.epiis.savat.dto.response.ResponseEquipoGetAll;
import com.epiis.savat.dto.response.ResponseEquipoInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "equipo")
public class EquipoController {

    private final BusinessEquipo businessEquipo;

    public EquipoController(BusinessEquipo businessEquipo) {
        this.businessEquipo = businessEquipo;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR','TECNICO')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponseEquipoGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessEquipo.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO')")
    @PostMapping(path = "insert")
    public ResponseEntity<ResponseEquipoInsert> actionInsert(
            @Valid @RequestBody RequestEquipo request,
            BindingResult bindingResult) {
        try {
            ResponseEquipoInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseEquipoInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessEquipo.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO')")
    @PutMapping(path = "update/{id}")
    public ResponseEntity<ResponseGeneric> actionUpdate(
            @PathVariable Integer id,
            @Valid @RequestBody RequestEquipo request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessEquipo.update(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO')")
    @DeleteMapping(path = "delete/{id}")
    public ResponseEntity<ResponseGeneric> actionDelete(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(businessEquipo.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
