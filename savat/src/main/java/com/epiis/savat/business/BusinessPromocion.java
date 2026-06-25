package com.epiis.savat.business;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.epiis.savat.dto.request.RequestPromocion;
import com.epiis.savat.dto.response.ResponsePromocionGetAll;
import com.epiis.savat.dto.response.ResponsePromocionInsert;
import com.epiis.savat.entity.EntityProducto;
import com.epiis.savat.entity.EntityPromocion;
import com.epiis.savat.entity.EntityPromocionProducto;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryProducto;
import com.epiis.savat.repository.RepositoryPromocion;
import com.epiis.savat.repository.RepositoryPromocionProducto;

@Service
public class BusinessPromocion {

    private final RepositoryPromocion repository;
    private final RepositoryPromocionProducto repositoryPromocionProducto;
    private final RepositoryProducto repositoryProducto;

    public BusinessPromocion(RepositoryPromocion repository,
                              RepositoryPromocionProducto repositoryPromocionProducto,
                              RepositoryProducto repositoryProducto) {
        this.repository = repository;
        this.repositoryPromocionProducto = repositoryPromocionProducto;
        this.repositoryProducto = repositoryProducto;
    }

    public ResponsePromocionGetAll getAll() {
        ResponsePromocionGetAll response = new ResponsePromocionGetAll();
        response.data = repository.findAll().stream()
                .map(p -> new ResponsePromocionGetAll.Item(
                        p.getIdPromocion(), p.getNombre(), p.getDescripcion(), p.getFechaInicio(), p.getFechaFin(),
                        p.getTipoDescuento() != null ? p.getTipoDescuento().name() : null,
                        p.getValorDescuento(), p.getEstado(),
                        repositoryPromocionProducto.findByPromocion(p.getIdPromocion()).stream()
                                .map(pp -> pp.getProducto().getNombre())
                                .toList()))
                .toList();
        response.success();
        return response;
    }

    @Transactional
    public ResponsePromocionInsert insert(RequestPromocion request) {
        ResponsePromocionInsert response = new ResponsePromocionInsert();

        EntityPromocion entity = new EntityPromocion();
        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }
        repository.save(entity);

        if (!vincularProductos(entity, request.getIdsProducto(), response.listMessage)) {
            return response;
        }

        response.idPromocion = entity.getIdPromocion();
        response.success();
        response.listMessage.add("Promoción registrada correctamente.");
        return response;
    }

    @Transactional
    public ResponseGeneric update(Integer id, RequestPromocion request) {
        ResponseGeneric response = new ResponseGeneric();

        var optEntity = repository.findById(id);
        if (optEntity.isEmpty()) {
            response.listMessage.add("La promoción no existe.");
            return response;
        }

        EntityPromocion entity = optEntity.get();
        if (!applyRequest(entity, request, response.listMessage)) {
            return response;
        }
        repository.save(entity);

        repositoryPromocionProducto.deleteByPromocion(id);
        if (!vincularProductos(entity, request.getIdsProducto(), response.listMessage)) {
            return response;
        }

        response.success();
        response.listMessage.add("Promoción actualizada correctamente.");
        return response;
    }

    @Transactional
    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("La promoción no existe.");
            return response;
        }

        repositoryPromocionProducto.deleteByPromocion(id);
        repository.deleteById(id);

        response.success();
        response.listMessage.add("Promoción eliminada correctamente.");
        return response;
    }

    private boolean applyRequest(EntityPromocion entity, RequestPromocion request, List<String> messages) {
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        entity.setFechaInicio(request.getFechaInicio());
        entity.setFechaFin(request.getFechaFin());
        entity.setValorDescuento(request.getValorDescuento());
        entity.setEstado(request.getEstado() != null ? request.getEstado() : true);

        if (request.getTipoDescuento() != null) {
            try {
                entity.setTipoDescuento(EntityPromocion.TipoDescuento.valueOf(request.getTipoDescuento()));
            } catch (IllegalArgumentException ex) {
                messages.add("El tipo de descuento debe ser PORCENTAJE o MONTO_FIJO.");
                return false;
            }
        }
        return true;
    }

    private boolean vincularProductos(EntityPromocion promocion, List<Integer> idsProducto, List<String> messages) {
        if (idsProducto == null || idsProducto.isEmpty()) {
            return true;
        }

        for (Integer idProducto : idsProducto) {
            var optProducto = repositoryProducto.findById(idProducto);
            if (optProducto.isEmpty()) {
                messages.add("El producto con id " + idProducto + " no existe.");
                return false;
            }
            EntityProducto producto = optProducto.get();

            EntityPromocionProducto pp = new EntityPromocionProducto();
            EntityPromocionProducto.PromocionProductoId id = new EntityPromocionProducto.PromocionProductoId();
            id.setIdPromocion(promocion.getIdPromocion());
            id.setIdProducto(producto.getIdProducto());
            pp.setId(id);
            pp.setPromocion(promocion);
            pp.setProducto(producto);
            repositoryPromocionProducto.save(pp);
        }
        return true;
    }
}
