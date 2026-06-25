package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestCliente;
import com.epiis.savat.dto.response.ResponseClienteGetAll;
import com.epiis.savat.dto.response.ResponseClienteInsert;
import com.epiis.savat.entity.EntityCliente;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryCategoriaCliente;
import com.epiis.savat.repository.RepositoryCliente;

@Service
public class BusinessCliente {

    private final RepositoryCliente repository;
    private final RepositoryCategoriaCliente repositoryCategoriaCliente;

    public BusinessCliente(RepositoryCliente repository, RepositoryCategoriaCliente repositoryCategoriaCliente) {
        this.repository = repository;
        this.repositoryCategoriaCliente = repositoryCategoriaCliente;
    }

    public ResponseClienteGetAll getAll() {
        ResponseClienteGetAll response = new ResponseClienteGetAll();
        response.data = repository.findAllWithDetails().stream()
                .map(c -> new ResponseClienteGetAll.Item(
                        c.getIdCliente(), c.getNombres(), c.getDniRuc(), c.getTelefono(), c.getCorreo(),
                        c.getDireccion(),
                        c.getCategoriaCliente() != null ? c.getCategoriaCliente().getIdCategoriaCliente() : null,
                        c.getCategoriaCliente() != null ? c.getCategoriaCliente().getNombre() : null))
                .toList();
        response.success();
        return response;
    }

    public ResponseClienteInsert insert(RequestCliente request) {
        ResponseClienteInsert response = new ResponseClienteInsert();

        EntityCliente entity = new EntityCliente();
        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }

        repository.save(entity);

        response.idCliente = entity.getIdCliente();
        response.success();
        response.listMessage.add("Cliente registrado correctamente.");
        return response;
    }

    public ResponseGeneric update(Integer id, RequestCliente request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("El cliente no existe.");
            return response;
        }

        EntityCliente entity = optEntity.get();
        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }

        repository.save(entity);

        response.success();
        response.listMessage.add("Cliente actualizado correctamente.");
        return response;
    }

    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("El cliente no existe.");
            return response;
        }

        repository.deleteById(id);
        response.success();
        response.listMessage.add("Cliente eliminado correctamente.");
        return response;
    }

    private boolean applyRequest(EntityCliente entity, RequestCliente request, java.util.List<String> messages) {
        entity.setNombres(request.getNombres());
        entity.setDniRuc(request.getDniRuc());
        entity.setTelefono(request.getTelefono());
        entity.setCorreo(request.getCorreo());
        entity.setDireccion(request.getDireccion());

        if (request.getIdCategoriaCliente() != null) {
            var optCategoria = repositoryCategoriaCliente.findById(request.getIdCategoriaCliente());
            if (optCategoria.isEmpty()) {
                messages.add("La categoría de cliente indicada no existe.");
                return false;
            }
            entity.setCategoriaCliente(optCategoria.get());
        } else {
            entity.setCategoriaCliente(null);
        }

        return true;
    }
}
