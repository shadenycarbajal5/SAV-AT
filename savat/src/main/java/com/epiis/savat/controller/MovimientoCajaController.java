package com.epiis.savat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.savat.business.BusinessMovimientoCaja;
import com.epiis.savat.dto.request.RequestMovimientoCaja;
import com.epiis.savat.dto.response.ResponseMovimientoCajaGetAll;
import com.epiis.savat.dto.response.ResponseMovimientoCajaInsert;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "movimientocaja")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','VENDEDOR')")
public class MovimientoCajaController {

    private final BusinessMovimientoCaja businessMovimientoCaja;

    public MovimientoCajaController(BusinessMovimientoCaja businessMovimientoCaja) {
        this.businessMovimientoCaja = businessMovimientoCaja;
    }

    @GetMapping(path = "getbycaja/{idCaja}")
    public ResponseEntity<ResponseMovimientoCajaGetAll> actionGetByCaja(@PathVariable Integer idCaja) {
        try {
            return ResponseEntity.ok(businessMovimientoCaja.getByCaja(idCaja));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(path = "insert")
    public ResponseEntity<ResponseMovimientoCajaInsert> actionInsert(
            @Valid @RequestBody RequestMovimientoCaja request,
            BindingResult bindingResult) {
        try {
            ResponseMovimientoCajaInsert response;

            if (bindingResult.hasErrors()) {
                response = new ResponseMovimientoCajaInsert();
                bindingResult.getAllErrors().forEach(e -> response.listMessage.add(e.getDefaultMessage()));
                return ResponseEntity.ok(response);
            }

            response = businessMovimientoCaja.insert(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
