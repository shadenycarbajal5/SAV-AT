package com.epiis.savat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseVentaGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idVenta;
        public LocalDateTime fecha;
        public BigDecimal subtotal;
        public BigDecimal descuento;
        public BigDecimal total;
        public String metodoPago;
        public Integer idCliente;
        public String clienteNombre;
        public Integer idUsuario;
        public String usuarioNombre;

        public Item(Integer idVenta, LocalDateTime fecha, BigDecimal subtotal, BigDecimal descuento,
                     BigDecimal total, String metodoPago, Integer idCliente, String clienteNombre,
                     Integer idUsuario, String usuarioNombre) {
            this.idVenta = idVenta;
            this.fecha = fecha;
            this.subtotal = subtotal;
            this.descuento = descuento;
            this.total = total;
            this.metodoPago = metodoPago;
            this.idCliente = idCliente;
            this.clienteNombre = clienteNombre;
            this.idUsuario = idUsuario;
            this.usuarioNombre = usuarioNombre;
        }
    }
}
