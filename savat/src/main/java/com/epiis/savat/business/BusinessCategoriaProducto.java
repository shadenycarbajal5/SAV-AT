package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestCategoriaProducto;
import com.epiis.savat.dto.response.ResponseCategoriaProductoGetAll;
import com.epiis.savat.dto.response.ResponseCategoriaProductoInsert;
import com.epiis.savat.entity.EntityCategoriaProducto;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryCategoriaProducto;

@Service
public class BusinessCategoriaProducto {

    private final RepositoryCategoriaProducto repository;

    public BusinessCategoriaProducto(RepositoryCategoriaProducto repository) {
        this.repository = repository;
    }

    public ResponseCategoriaProductoGetAll getAll() {
        ResponseCategoriaProductoGetAll response = new ResponseCategoriaProductoGetAll();
        response.data = repository.findAll().stream()
                .map(c -> new ResponseCategoriaProductoGetAll.Item(c.getIdCategoriaProducto(), c.getNombre()))
                .toList();
        response.success();
        return response;
    }

    public ResponseCategoriaProductoInsert insert(RequestCategoriaProducto request) {
        ResponseCategoriaProductoInsert response = new ResponseCategoriaProductoInsert();

        EntityCategoriaProducto entity = new EntityCategoriaProducto();
        entity.setNombre(request.getNombre());
        repository.save(entity);

        response.idCategoriaProducto = entity.getIdCategoriaProducto();
        response.success();
        response.listMessage.add("Categoría de producto registrada correctamente.");
        return response;
    }

    public ResponseGeneric update(Integer id, RequestCategoriaProducto request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("La categoría no existe.");
            return response;
        }

        EntityCategoriaProducto entity = optEntity.get();
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
