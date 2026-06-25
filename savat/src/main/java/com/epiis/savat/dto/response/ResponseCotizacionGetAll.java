package com.epiis.savat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseCotizacionGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idCotizacion;
        public LocalDateTime fecha;
        public LocalDate fechaVencimiento;
        public String estado;
        public BigDecimal total;
        public Integer idCliente;
        public String clienteNombre;

        public Item(Integer idCotizacion, LocalDateTime fecha, LocalDate fechaVencimiento, String estado,
                     BigDecimal total, Integer idCliente, String clienteNombre) {
            this.idCotizacion = idCotizacion;
            this.fecha = fecha;
            this.fechaVencimiento = fechaVencimiento;
            this.estado = estado;
            this.total = total;
            this.idCliente = idCliente;
            this.clienteNombre = clienteNombre;
        }
    }
}
