package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessCotizacion;
import com.epiis.savat.dto.request.RequestCotizacion;
import com.epiis.savat.dto.request.RequestCotizacionEstado;
import com.epiis.savat.dto.response.ResponseCotizacionGetAll;
import com.epiis.savat.dto.response.ResponseCotizacionInsert;
import com.epiis.savat.generic.ResponseGeneric;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "cotizacion")
public class CotizacionController {

    private final BusinessCotizacion businessCotizacion;

    public CotizacionController(BusinessCotizacion businessCotizacion) {
        this.businessCotizacion = businessCotizacion;
    }

    @GetMapping(path = "getall")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    public ResponseEntity<ResponseCotizacionGetAll> actionGetAll() {
        try {
            return ResponseEntity.ok(businessCotizacion.getAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(path = "insert")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    public ResponseEntity<ResponseCotizacionInsert> actionInsert(
            @Valid @RequestBody RequestCotizacion request,
            BindingResult bindingResult) {
        try {
            ResponseCotizacionInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseCotizacionInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCotizacion.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping(path = "estado/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
    public ResponseEntity<ResponseGeneric> actionActualizarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody RequestCotizacionEstado request,
            BindingResult bindingResult) {
        try {
            ResponseGeneric response;

            if (bindingResult.hasErrors()) {
                response = new ResponseGeneric();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessCotizacion.actualizarEstado(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping(path = "delete/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ResponseGeneric> actionDelete(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(businessCotizacion.delete(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
