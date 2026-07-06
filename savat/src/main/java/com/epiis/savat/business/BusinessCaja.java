package com.epiis.savat.business;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestCajaApertura;
import com.epiis.savat.dto.request.RequestCajaCierre;
import com.epiis.savat.dto.response.ResponseCajaGetAll;
import com.epiis.savat.dto.response.ResponseCajaInsert;
import com.epiis.savat.entity.EntityCaja;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryCaja;

@Service
public class BusinessCaja {

    private final RepositoryCaja repository;

    public BusinessCaja(RepositoryCaja repository) {
        this.repository = repository;
    }

    public ResponseCajaGetAll getAll() {
        ResponseCajaGetAll response = new ResponseCajaGetAll();
        response.data = repository.findAll().stream()
                .map(c -> new ResponseCajaGetAll.Item(
                        c.getIdCaja(), c.getFechaApertura(), c.getFechaCierre(),
                        c.getMontoInicial(), c.getMontoFinal()))
                .toList();
        response.success();
        return response;
    }

    public ResponseCajaInsert abrir(RequestCajaApertura request) {
        ResponseCajaInsert response = new ResponseCajaInsert();

        if (repository.findCajaAbierta().isPresent()) {
            response.listMessage.add("Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva.");
            return response;
        }

        EntityCaja entity = new EntityCaja();
        entity.setFechaApertura(LocalDateTime.now());
        entity.setMontoInicial(request.getMontoInicial());
        repository.save(entity);

        response.idCaja = entity.getIdCaja();
        response.success();
        response.listMessage.add("Caja abierta correctamente.");
        return response;
    }

    public ResponseGeneric cerrar(Integer id, RequestCajaCierre request) {
        ResponseGeneric response = new ResponseGeneric();

        var optCaja = repository.findById(id);
        if (optCaja.isEmpty()) {
            response.listMessage.add("La caja no existe.");
            return response;
        }

        EntityCaja entity = optCaja.get();
        if (entity.getFechaCierre() != null) {
            response.listMessage.add("Esta caja ya se encuentra cerrada.");
            return response;
        }

        entity.setFechaCierre(LocalDateTime.now());
        entity.setMontoFinal(request.getMontoFinal());
        repository.save(entity);

        response.success();
        response.listMessage.add("Caja cerrada correctamente.");
        return response;
    }
}
