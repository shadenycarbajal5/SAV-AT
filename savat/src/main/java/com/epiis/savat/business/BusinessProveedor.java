package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestProveedor;
import com.epiis.savat.dto.response.ResponseProveedorGetAll;
import com.epiis.savat.dto.response.ResponseProveedorInsert;
import com.epiis.savat.entity.EntityProveedor;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryProveedor;

@Service
public class BusinessProveedor {

    private final RepositoryProveedor repository;

    public BusinessProveedor(RepositoryProveedor repository) {
        this.repository = repository;
    }

    public ResponseProveedorGetAll getAll() {
        ResponseProveedorGetAll response = new ResponseProveedorGetAll();
        response.data = repository.findAll().stream()
                .map(p -> new ResponseProveedorGetAll.Item(
                        p.getIdProveedor(), p.getNombre(), p.getRuc(),
                        p.getTelefono(), p.getCorreo(), p.getDireccion()))
                .toList();
        response.success();
        return response;
    }

    public ResponseProveedorInsert insert(RequestProveedor request) {
        ResponseProveedorInsert response = new ResponseProveedorInsert();

        EntityProveedor entity = new EntityProveedor();
        applyRequest(entity, request);
        repository.save(entity);

        response.idProveedor = entity.getIdProveedor();
        response.success();
        response.listMessage.add("Proveedor registrado correctamente.");
        return response;
    }

    public ResponseGeneric update(Integer id, RequestProveedor request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("El proveedor no existe.");
            return response;
        }

        EntityProveedor entity = optEntity.get();
        applyRequest(entity, request);
        repository.save(entity);

        response.success();
        response.listMessage.add("Proveedor actualizado correctamente.");
        return response;
    }

    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("El proveedor no existe.");
            return response;
        }

        repository.deleteById(id);
        response.success();
        response.listMessage.add("Proveedor eliminado correctamente.");
        return response;
    }

    private void applyRequest(EntityProveedor entity, RequestProveedor request) {
        entity.setNombre(request.getNombre());
        entity.setRuc(request.getRuc());
        entity.setTelefono(request.getTelefono());
        entity.setCorreo(request.getCorreo());
        entity.setDireccion(request.getDireccion());
    }
}
