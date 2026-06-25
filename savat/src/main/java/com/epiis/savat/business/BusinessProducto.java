package com.epiis.savat.business;

import org.springframework.stereotype.Service;

import com.epiis.savat.dto.request.RequestProducto;
import com.epiis.savat.dto.response.ResponseProductoGetAll;
import com.epiis.savat.dto.response.ResponseProductoInsert;
import com.epiis.savat.entity.EntityProducto;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryCategoriaProducto;
import com.epiis.savat.repository.RepositoryProducto;
import com.epiis.savat.repository.RepositoryProveedor;

@Service
public class BusinessProducto {

    private final RepositoryProducto repository;
    private final RepositoryCategoriaProducto repositoryCategoriaProducto;
    private final RepositoryProveedor repositoryProveedor;

    public BusinessProducto(RepositoryProducto repository,
                             RepositoryCategoriaProducto repositoryCategoriaProducto,
                             RepositoryProveedor repositoryProveedor) {
        this.repository = repository;
        this.repositoryCategoriaProducto = repositoryCategoriaProducto;
        this.repositoryProveedor = repositoryProveedor;
    }

    public ResponseProductoGetAll getAll() {
        ResponseProductoGetAll response = new ResponseProductoGetAll();
        response.data = repository.findAllWithDetails().stream()
                .map(p -> new ResponseProductoGetAll.Item(
                        p.getIdProducto(), p.getNombre(), p.getDescripcion(), p.getPrecioVenta(),
                        p.getCosto(), p.getStock(), p.getStockMinimo(), p.getCodigoBarras(),
                        p.getTipoProducto() != null ? p.getTipoProducto().name() : null,
                        p.getEstado(),
                        p.getCategoriaProducto() != null ? p.getCategoriaProducto().getIdCategoriaProducto() : null,
                        p.getCategoriaProducto() != null ? p.getCategoriaProducto().getNombre() : null,
                        p.getProveedor() != null ? p.getProveedor().getIdProveedor() : null,
                        p.getProveedor() != null ? p.getProveedor().getNombre() : null
                ))
                .toList();
        response.success();
        return response;
    }

    public ResponseProductoInsert insert(RequestProducto request) {
        ResponseProductoInsert response = new ResponseProductoInsert();

        EntityProducto entity = new EntityProducto();
        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }

        repository.save(entity);

        response.idProducto = entity.getIdProducto();
        response.success();
        response.listMessage.add("Producto registrado correctamente.");
        return response;
    }

    public ResponseGeneric update(Integer id, RequestProducto request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("El producto no existe.");
            return response;
        }

        EntityProducto entity = optEntity.get();
        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }

        repository.save(entity);

        response.success();
        response.listMessage.add("Producto actualizado correctamente.");
        return response;
    }

    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("El producto no existe.");
            return response;
        }

        repository.deleteById(id);
        response.success();
        response.listMessage.add("Producto eliminado correctamente.");
        return response;
    }

    private boolean applyRequest(EntityProducto entity, RequestProducto request, java.util.List<String> messages) {
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        entity.setPrecioVenta(request.getPrecioVenta());
        entity.setCosto(request.getCosto());
        entity.setStock(request.getStock() != null ? request.getStock() : 0);
        entity.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 0);
        entity.setCodigoBarras(request.getCodigoBarras());
        entity.setEstado(request.getEstado() != null ? request.getEstado() : true);

        if (request.getTipoProducto() != null) {
            try {
                entity.setTipoProducto(EntityProducto.TipoProducto.valueOf(request.getTipoProducto()));
            } catch (IllegalArgumentException ex) {
                messages.add("El tipo de producto debe ser VENTA o REPUESTO.");
                return false;
            }
        }

        if (request.getIdCategoriaProducto() != null) {
            var optCategoria = repositoryCategoriaProducto.findById(request.getIdCategoriaProducto());
            if (optCategoria.isEmpty()) {
                messages.add("La categoría de producto indicada no existe.");
                return false;
            }
            entity.setCategoriaProducto(optCategoria.get());
        } else {
            entity.setCategoriaProducto(null);
        }

        if (request.getIdProveedor() != null) {
            var optProveedor = repositoryProveedor.findById(request.getIdProveedor());
            if (optProveedor.isEmpty()) {
                messages.add("El proveedor indicado no existe.");
                return false;
            }
            entity.setProveedor(optProveedor.get());
        } else {
            entity.setProveedor(null);
        }

        return true;
    }
}
