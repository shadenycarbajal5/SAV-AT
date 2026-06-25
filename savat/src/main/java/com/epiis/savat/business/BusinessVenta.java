package com.epiis.savat.business;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.epiis.savat.dto.request.RequestVenta;
import com.epiis.savat.dto.response.ResponseVentaGetAll;
import com.epiis.savat.dto.response.ResponseVentaInsert;
import com.epiis.savat.entity.EntityCliente;
import com.epiis.savat.entity.EntityDetalleVenta;
import com.epiis.savat.entity.EntityProducto;
import com.epiis.savat.entity.EntityUsuario;
import com.epiis.savat.entity.EntityVenta;
import com.epiis.savat.repository.RepositoryCliente;
import com.epiis.savat.repository.RepositoryDetalleVenta;
import com.epiis.savat.repository.RepositoryProducto;
import com.epiis.savat.repository.RepositoryUsuario;
import com.epiis.savat.repository.RepositoryVenta;

@Service
public class BusinessVenta {

    private final RepositoryVenta repositoryVenta;
    private final RepositoryDetalleVenta repositoryDetalleVenta;
    private final RepositoryProducto repositoryProducto;
    private final RepositoryCliente repositoryCliente;
    private final RepositoryUsuario repositoryUsuario;

    public BusinessVenta(RepositoryVenta repositoryVenta,
                          RepositoryDetalleVenta repositoryDetalleVenta,
                          RepositoryProducto repositoryProducto,
                          RepositoryCliente repositoryCliente,
                          RepositoryUsuario repositoryUsuario) {
        this.repositoryVenta = repositoryVenta;
        this.repositoryDetalleVenta = repositoryDetalleVenta;
        this.repositoryProducto = repositoryProducto;
        this.repositoryCliente = repositoryCliente;
        this.repositoryUsuario = repositoryUsuario;
    }

    public ResponseVentaGetAll getAll() {
        ResponseVentaGetAll response = new ResponseVentaGetAll();
        response.data = repositoryVenta.findAllWithDetails().stream()
                .map(v -> new ResponseVentaGetAll.Item(
                        v.getIdVenta(), v.getFecha(), v.getSubtotal(), v.getDescuento(), v.getTotal(),
                        v.getMetodoPago() != null ? v.getMetodoPago().name() : null,
                        v.getCliente() != null ? v.getCliente().getIdCliente() : null,
                        v.getCliente() != null ? v.getCliente().getNombres() : null,
                        v.getUsuario() != null ? v.getUsuario().getIdUsuario() : null,
                        v.getUsuario() != null ? v.getUsuario().getNombres() : null))
                .toList();
        response.success();
        return response;
    }

    @Transactional
    public ResponseVentaInsert insert(RequestVenta request) {
        ResponseVentaInsert response = new ResponseVentaInsert();

        var optUsuario = repositoryUsuario.findById(request.getIdUsuario());
        if (optUsuario.isEmpty()) {
            response.listMessage.add("El usuario indicado no existe.");
            return response;
        }
        EntityUsuario usuario = optUsuario.get();

        EntityCliente cliente = null;
        if (request.getIdCliente() != null) {
            var optCliente = repositoryCliente.findById(request.getIdCliente());
            if (optCliente.isEmpty()) {
                response.listMessage.add("El cliente indicado no existe.");
                return response;
            }
            cliente = optCliente.get();
        }

        // ---- Validar stock y calcular totales ANTES de persistir nada ----
        List<EntityProducto> productosCache = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (RequestVenta.DetalleItem item : request.getDetalle()) {
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

            if (producto.getStock() == null || producto.getStock() < item.getCantidad()) {
                response.listMessage.add("Stock insuficiente para '" + producto.getNombre() + "'. Disponible: "
                        + (producto.getStock() != null ? producto.getStock() : 0));
                return response;
            }

            BigDecimal precioUnitario = producto.getPrecioVenta() != null ? producto.getPrecioVenta() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));
            subtotal = subtotal.add(lineSubtotal);

            productosCache.add(producto);
        }

        BigDecimal descuento = request.getDescuento() != null ? request.getDescuento() : BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(descuento);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        // ---- Crear la venta ----
        EntityVenta venta = new EntityVenta();
        venta.setSubtotal(subtotal);
        venta.setDescuento(descuento);
        venta.setTotal(total);
        venta.setCliente(cliente);
        venta.setUsuario(usuario);

        if (request.getMetodoPago() != null) {
            try {
                venta.setMetodoPago(EntityVenta.MetodoPago.valueOf(request.getMetodoPago()));
            } catch (IllegalArgumentException ex) {
                response.listMessage.add("Método de pago inválido. Use EFECTIVO, TARJETA, TRANSFERENCIA, YAPE o PLIN.");
                return response;
            }
        }

        repositoryVenta.save(venta);

        // ---- Crear detalle y descontar stock ----
        for (int i = 0; i < request.getDetalle().size(); i++) {
            RequestVenta.DetalleItem item = request.getDetalle().get(i);
            EntityProducto producto = productosCache.get(i);

            BigDecimal precioUnitario = producto.getPrecioVenta() != null ? producto.getPrecioVenta() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            EntityDetalleVenta detalle = new EntityDetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(lineSubtotal);
            repositoryDetalleVenta.save(detalle);

            producto.setStock(producto.getStock() - item.getCantidad());
            repositoryProducto.save(producto);
        }

        response.idVenta = venta.getIdVenta();
        response.total = total;
        response.success();
        response.listMessage.add("Venta registrada correctamente.");
        return response;
    }
}
