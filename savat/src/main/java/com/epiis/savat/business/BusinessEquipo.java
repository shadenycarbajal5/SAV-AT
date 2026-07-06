package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestEquipo;
import com.epiis.savat.dto.response.ResponseEquipoGetAll;
import com.epiis.savat.dto.response.ResponseEquipoInsert;
import com.epiis.savat.entity.EntityEquipo;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryEquipo;

@Service
public class BusinessEquipo {

    private final RepositoryEquipo repository;

    public BusinessEquipo(RepositoryEquipo repository) {
        this.repository = repository;
    }

    public ResponseEquipoGetAll getAll() {
        ResponseEquipoGetAll response = new ResponseEquipoGetAll();
        response.data = repository.findAll().stream()
                .map(e -> new ResponseEquipoGetAll.Item(e.getIdEquipo(), e.getMarca(), e.getModelo(), e.getNumeroSerie()))
                .toList();
        response.success();
        return response;
    }

    public ResponseEquipoInsert insert(RequestEquipo request) {
        ResponseEquipoInsert response = new ResponseEquipoInsert();

        EntityEquipo entity = new EntityEquipo();
        entity.setMarca(request.getMarca());
        entity.setModelo(request.getModelo());
        entity.setNumeroSerie(request.getNumeroSerie());
        repository.save(entity);

        response.idEquipo = entity.getIdEquipo();
        response.success();
        response.listMessage.add("Equipo registrado correctamente.");
        return response;
    }

    public ResponseGeneric update(Integer id, RequestEquipo request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("El equipo no existe.");
            return response;
        }

        EntityEquipo entity = optEntity.get();
        entity.setMarca(request.getMarca());
        entity.setModelo(request.getModelo());
        entity.setNumeroSerie(request.getNumeroSerie());
        repository.save(entity);

        response.success();
        response.listMessage.add("Equipo actualizado correctamente.");
        return response;
    }

    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("El equipo no existe.");
            return response;
        }

        repository.deleteById(id);
        response.success();
        response.listMessage.add("Equipo eliminado correctamente.");
        return response;
    }
}
