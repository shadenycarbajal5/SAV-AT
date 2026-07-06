package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.response.ResponseRolGetAll;
import com.epiis.savat.repository.RepositoryRol;

@Service
public class BusinessRol {

    private final RepositoryRol repository;

    public BusinessRol(RepositoryRol repository) {
        this.repository = repository;
    }

    public ResponseRolGetAll getAll() {
        ResponseRolGetAll response = new ResponseRolGetAll();
        response.data = repository.findAll().stream()
                .map(r -> new ResponseRolGetAll.Item(r.getIdRol(), r.getNombre()))
                .toList();
        response.success();
        return response;
    }
}
