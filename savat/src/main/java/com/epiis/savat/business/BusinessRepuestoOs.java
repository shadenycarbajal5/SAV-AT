package com.epiis.savat.business;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.epiis.savat.dto.request.RequestRepuestoOs;
import com.epiis.savat.dto.response.ResponseRepuestoOsGetAll;
import com.epiis.savat.dto.response.ResponseRepuestoOsInsert;
import com.epiis.savat.entity.EntityOrdenServicio;
import com.epiis.savat.entity.EntityProducto;
import com.epiis.savat.entity.EntityRepuestoOs;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryOrdenServicio;
import com.epiis.savat.repository.RepositoryProducto;
import com.epiis.savat.repository.RepositoryRepuestoOs;

@Service
public class BusinessRepuestoOs {

    private final RepositoryRepuestoOs repository;
    private final RepositoryOrdenServicio repositoryOrdenServicio;
    private final RepositoryProducto repositoryProducto;

    public BusinessRepuestoOs(RepositoryRepuestoOs repository,
                               RepositoryOrdenServicio repositoryOrdenServicio,
                               RepositoryProducto repositoryProducto) {
        this.repository = repository;
        this.repositoryOrdenServicio = repositoryOrdenServicio;
        this.repositoryProducto = repositoryProducto;
    }

    public ResponseRepuestoOsGetAll getByOrdenServicio(Integer idOs) {
        ResponseRepuestoOsGetAll response = new ResponseRepuestoOsGetAll();
        response.data = repository.findByOrdenServicio(idOs).stream()
                .map(r -> new ResponseRepuestoOsGetAll.Item(
                        r.getIdRepuestoOs(),
                        r.getOrdenServicio().getIdOs(),
                        r.getProducto().getIdProducto(),
                        r.getProducto().getNombre(),
                        r.getCantidad()))
                .toList();
        response.success();
        return response;
    }

    @Transactional
    public ResponseRepuestoOsInsert insert(RequestRepuestoOs request) {
        ResponseRepuestoOsInsert response = new ResponseRepuestoOsInsert();

        var optOs = repositoryOrdenServicio.findById(request.getIdOs());
        if (optOs.isEmpty()) {
            response.listMessage.add("La orden de servicio indicada no existe.");
            return response;
        }
        EntityOrdenServicio ordenServicio = optOs.get();

        var optProducto = repositoryProducto.findById(request.getIdProducto());
        if (optProducto.isEmpty()) {
            response.listMessage.add("El producto indicado no existe.");
            return response;
        }
        EntityProducto producto = optProducto.get();

        if (request.getCantidad() == null || request.getCantidad() <= 0) {
            response.listMessage.add("La cantidad debe ser mayor a cero.");
            return response;
        }

        if (producto.getStock() == null || producto.getStock() < request.getCantidad()) {
            response.listMessage.add("Stock insuficiente para '" + producto.getNombre() + "'. Disponible: "
                    + (producto.getStock() != null ? producto.getStock() : 0));
            return response;
        }

        EntityRepuestoOs repuesto = new EntityRepuestoOs();
        repuesto.setOrdenServicio(ordenServicio);
        repuesto.setProducto(producto);
        repuesto.setCantidad(request.getCantidad());
        repository.save(repuesto);

        producto.setStock(producto.getStock() - request.getCantidad());
        repositoryProducto.save(producto);

        response.idRepuestoOs = repuesto.getIdRepuestoOs();
        response.success();
        response.listMessage.add("Repuesto agregado a la orden de servicio correctamente.");
        return response;
    }

    @Transactional
    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        var optRepuesto = repository.findById(id);
        if (optRepuesto.isEmpty()) {
            response.listMessage.add("El registro de repuesto no existe.");
            return response;
        }

        EntityRepuestoOs repuesto = optRepuesto.get();
        EntityProducto producto = repuesto.getProducto();

        // Devolver el stock al eliminar el repuesto usado.
        producto.setStock((producto.getStock() != null ? producto.getStock() : 0) + repuesto.getCantidad());
        repositoryProducto.save(producto);

        repository.deleteById(id);

        response.success();
        response.listMessage.add("Repuesto eliminado y stock restituido correctamente.");
        return response;
    }
}
