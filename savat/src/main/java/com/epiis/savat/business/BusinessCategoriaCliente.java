package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestCategoriaCliente;
import com.epiis.savat.dto.response.ResponseCategoriaClienteGetAll;
import com.epiis.savat.dto.response.ResponseCategoriaClienteInsert;
import com.epiis.savat.entity.EntityCategoriaCliente;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryCategoriaCliente;

@Service
public class BusinessCategoriaCliente {

    private final RepositoryCategoriaCliente repository;

    public BusinessCategoriaCliente(RepositoryCategoriaCliente repository) {
        this.repository = repository;
    }

    public ResponseCategoriaClienteGetAll getAll() {
        ResponseCategoriaClienteGetAll response = new ResponseCategoriaClienteGetAll();
        response.data = repository.findAll().stream()
                .map(c -> new ResponseCategoriaClienteGetAll.Item(c.getIdCategoriaCliente(), c.getNombre()))
                .toList();
        response.success();
        return response;
    }

    public ResponseCategoriaClienteInsert insert(RequestCategoriaCliente request) {
        ResponseCategoriaClienteInsert response = new ResponseCategoriaClienteInsert();

        EntityCategoriaCliente entity = new EntityCategoriaCliente();
        entity.setNombre(request.getNombre());
        repository.save(entity);

        response.idCategoriaCliente = entity.getIdCategoriaCliente();
        response.success();
        response.listMessage.add("Categoría de cliente registrada correctamente.");
        return response;
    }

    public ResponseGeneric update(Integer id, RequestCategoriaCliente request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("La categoría no existe.");
            return response;
        }

        EntityCategoriaCliente entity = optEntity.get();
        entity.setNombre(request.getNombre());
        repository.save(entity);

        response.success();
        response.listMessage.add("Categoría actualizada correctamente.");
        return response;
    }

    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("La categoría no existe.");
            return response;
        }

        repository.deleteById(id);
        response.success();
        response.listMessage.add("Categoría eliminada correctamente.");
        return response;
    }
}
