package com.epiis.savat.business;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.epiis.savat.dto.request.RequestCotizacion;
import com.epiis.savat.dto.request.RequestCotizacionEstado;
import com.epiis.savat.dto.response.ResponseCotizacionGetAll;
import com.epiis.savat.dto.response.ResponseCotizacionInsert;
import com.epiis.savat.entity.EntityCliente;
import com.epiis.savat.entity.EntityCotizacion;
import com.epiis.savat.entity.EntityDetalleCotizacion;
import com.epiis.savat.entity.EntityProducto;
import com.epiis.savat.generic.ResponseGeneric;
import com.epiis.savat.repository.RepositoryCliente;
import com.epiis.savat.repository.RepositoryCotizacion;
import com.epiis.savat.repository.RepositoryDetalleCotizacion;
import com.epiis.savat.repository.RepositoryProducto;

@Service
public class BusinessCotizacion {

    private final RepositoryCotizacion repository;
    private final RepositoryDetalleCotizacion repositoryDetalle;
    private final RepositoryProducto repositoryProducto;
    private final RepositoryCliente repositoryCliente;

    public BusinessCotizacion(RepositoryCotizacion repository,
                               RepositoryDetalleCotizacion repositoryDetalle,
                               RepositoryProducto repositoryProducto,
                               RepositoryCliente repositoryCliente) {
        this.repository = repository;
        this.repositoryDetalle = repositoryDetalle;
        this.repositoryProducto = repositoryProducto;
        this.repositoryCliente = repositoryCliente;
    }

    public ResponseCotizacionGetAll getAll() {
        ResponseCotizacionGetAll response = new ResponseCotizacionGetAll();
        response.data = repository.findAllWithDetails().stream()
                .map(c -> new ResponseCotizacionGetAll.Item(
                        c.getIdCotizacion(), c.getFecha(), c.getFechaVencimiento(),
                        c.getEstado() != null ? c.getEstado().name() : null,
                        c.getTotal(),
                        c.getCliente() != null ? c.getCliente().getIdCliente() : null,
                        c.getCliente() != null ? c.getCliente().getNombres() : null))
                .toList();
        response.success();
        return response;
    }

    @Transactional
    public ResponseCotizacionInsert insert(RequestCotizacion request) {
        ResponseCotizacionInsert response = new ResponseCotizacionInsert();

        var optCliente = repositoryCliente.findById(request.getIdCliente());
        if (optCliente.isEmpty()) {
            response.listMessage.add("El cliente indicado no existe.");
            return response;
        }
        EntityCliente cliente = optCliente.get();

        List<EntityProducto> productosCache = new java.util.ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (RequestCotizacion.DetalleItem item : request.getDetalle()) {
            var optProducto = repositoryProducto.findById(item.getIdProducto());
            if (optProducto.isEmpty()) {
                response.listMessage.add("El producto con id " + item.getIdProducto() + " no existe.");
                return response;
            }
            EntityProducto producto = optProducto.get();

            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                response.listMessage.add("La cantidad para '" + producto.getNombre() + "' debe ser mayor a cero.");
                return response;
            }

            BigDecimal precioUnitario = producto.getPrecioVenta() != null ? producto.getPrecioVenta() : BigDecimal.ZERO;
            total = total.add(precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad())));
            productosCache.add(producto);
        }

        EntityCotizacion cotizacion = new EntityCotizacion();
        cotizacion.setFechaVencimiento(request.getFechaVencimiento());
        cotizacion.setEstado(EntityCotizacion.Estado.PENDIENTE);
        cotizacion.setTotal(total);
        cotizacion.setCliente(cliente);
        repository.save(cotizacion);

        for (int i = 0; i < request.getDetalle().size(); i++) {
            RequestCotizacion.DetalleItem item = request.getDetalle().get(i);
            EntityProducto producto = productosCache.get(i);
            BigDecimal precioUnitario = producto.getPrecioVenta() != null ? producto.getPrecioVenta() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            EntityDetalleCotizacion detalle = new EntityDetalleCotizacion();
            detalle.setCotizacion(cotizacion);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(lineSubtotal);
            repositoryDetalle.save(detalle);
        }

        response.idCotizacion = cotizacion.getIdCotizacion();
        response.total = total;
        response.success();
        response.listMessage.add("Cotización registrada correctamente.");
        return response;
    }

    public ResponseGeneric actualizarEstado(Integer id, RequestCotizacionEstado request) {
        ResponseGeneric response = new ResponseGeneric();

        var optCotizacion = repository.findById(id);
        if (optCotizacion.isEmpty()) {
            response.listMessage.add("La cotización no existe.");
            return response;
        }

        EntityCotizacion.Estado nuevoEstado;
        try {
            nuevoEstado = EntityCotizacion.Estado.valueOf(request.getEstado());
        } catch (IllegalArgumentException ex) {
            response.listMessage.add("Estado inválido. Use PENDIENTE, APROBADA, RECHAZADA o CONVERTIDA.");
            return response;
        }

        EntityCotizacion cotizacion = optCotizacion.get();
        cotizacion.setEstado(nuevoEstado);
        repository.save(cotizacion);

        response.success();
        response.listMessage.add("Estado de la cotización actualizado correctamente.");
        return response;
    }

    public ResponseGeneric delete(Integer id) {
        ResponseGeneric response = new ResponseGeneric();

        if (!repository.existsById(id)) {
            response.listMessage.add("La cotización no existe.");
            return response;
        }

        repository.deleteById(id);
        response.success();
        response.listMessage.add("Cotización eliminada correctamente.");
        return response;
    }
}
