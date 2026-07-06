package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessCaja;
import com.epiis.savat.dto.request.RequestCajaApertura;
import com.epiis.savat.dto.request.RequestCajaCierre;
import com.epiis.savat.dto.response.ResponseCajaGetAll;
import com.epiis.savat.dto.response.ResponseCajaInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "caja")
public class CajaController {

    private final BusinessCaja businessCaja;

    public CajaController(BusinessCaja businessCaja) {
        this.businessCaja = businessCaja;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponseCajaGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessCaja.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping(path = "abrir")
    public ResponseEntity<ResponseCajaInsert> actionAbrir(
            @Valid @RequestBody RequestCajaApertura request,
            BindingResult bindingResult) {
        try {
            ResponseCajaInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseCajaInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCaja.abrir(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping(path = "cerrar/{id}")
    public ResponseEntity<ResponseGeneric> actionCerrar(
            @PathVariable Integer id,
            @Valid @RequestBody RequestCajaCierre request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCaja.cerrar(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
