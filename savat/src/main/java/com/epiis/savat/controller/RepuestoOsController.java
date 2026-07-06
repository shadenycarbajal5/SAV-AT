package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessRepuestoOs;
import com.epiis.savat.dto.request.RequestRepuestoOs;
import com.epiis.savat.dto.response.ResponseRepuestoOsGetAll;
import com.epiis.savat.dto.response.ResponseRepuestoOsInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "repuestoos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO')")
public class RepuestoOsController {

    private final BusinessRepuestoOs businessRepuestoOs;

    public RepuestoOsController(BusinessRepuestoOs businessRepuestoOs) {
        this.businessRepuestoOs = businessRepuestoOs;
    }

    @GetMapping(path = "getbyordenservicio/{idOs}")
    public ResponseEntity<ResponseRepuestoOsGetAll> actionGetByOrdenServicio(@PathVariable Integer idOs) {
        try {
            return ResponseEntity.ok(businessRepuestoOs.getByOrdenServicio(idOs));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(path = "insert")
    public ResponseEntity<ResponseRepuestoOsInsert> actionInsert(
            @Valid @RequestBody RequestRepuestoOs request,
            BindingResult bindingResult) {
        try {
            ResponseRepuestoOsInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseRepuestoOsInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessRepuestoOs.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping(path = "delete/{id}")
    public ResponseEntity<ResponseGeneric> actionDelete(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(businessRepuestoOs.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
