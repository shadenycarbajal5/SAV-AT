package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessRol;
import com.epiis.savat.dto.response.ResponseRolGetAll;

@RestController
@RequestMapping(path = "rol")
public class RolController {

    private final BusinessRol businessRol;

    public RolController(BusinessRol businessRol) {
        this.businessRol = businessRol;
    }

    @GetMapping(path = "getall")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ResponseRolGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessRol.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
