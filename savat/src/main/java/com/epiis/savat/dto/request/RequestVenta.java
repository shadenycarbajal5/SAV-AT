package com.epiis.savat.dto.request;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestVenta {

    private BigDecimal descuento;
    private String metodoPago; // EFECTIVO, TARJETA, TRANSFERENCIA, YAPE, PLIN

    private Integer idCliente;

    @NotNull(message = "El usuario que registra la venta es requerido.")
    private Integer idUsuario;

    @NotEmpty(message = "La venta debe tener al menos un producto.")
    @Valid
    private List<DetalleItem> detalle;

    @Getter
    @Setter
    public static class DetalleItem {

        @NotNull(message = "El producto es requerido en cada detalle.")
        private Integer idProducto;

        @NotNull(message = "La cantidad es requerida en cada detalle.")
        private Integer cantidad;
    }
}
