package com.epiis.savat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponsePromocionGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idPromocion;
        public String nombre;
        public String descripcion;
        public LocalDate fechaInicio;
        public LocalDate fechaFin;
        public String tipoDescuento;
        public BigDecimal valorDescuento;
        public Boolean estado;
        public List<String> productos;

        public Item(Integer idPromocion, String nombre, String descripcion, LocalDate fechaInicio,
                     LocalDate fechaFin, String tipoDescuento, BigDecimal valorDescuento, Boolean estado,
                     List<String> productos) {
            this.idPromocion = idPromocion;
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.fechaInicio = fechaInicio;
            this.fechaFin = fechaFin;
            this.tipoDescuento = tipoDescuento;
            this.valorDescuento = valorDescuento;
            this.estado = estado;
            this.productos = productos;
        }
    }
}
