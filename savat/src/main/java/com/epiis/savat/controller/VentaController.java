package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessVenta;
import com.epiis.savat.dto.request.RequestVenta;
import com.epiis.savat.dto.response.ResponseVentaGetAll;
import com.epiis.savat.dto.response.ResponseVentaInsert;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "venta")
public class VentaController {

    private final BusinessVenta businessVenta;

    public VentaController(BusinessVenta businessVenta) {
        this.businessVenta = businessVenta;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    @GetMapping(path = "getall")
    public ResponseEntity<ResponseVentaGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessVenta.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    @PostMapping(path = "insert")
    public ResponseEntity<ResponseVentaInsert> actionInsert(
            @Valid @RequestBody RequestVenta request,
            BindingResult bindingResult) {
        try {
            ResponseVentaInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseVentaInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessVenta.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
