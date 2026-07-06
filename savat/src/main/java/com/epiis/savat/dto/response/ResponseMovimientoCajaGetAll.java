package com.epiis.savat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseMovimientoCajaGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idMovimiento;
        public LocalDateTime fecha;
        public String tipo;
        public String descripcion;
        public BigDecimal monto;
        public Integer idCaja;

        public Item(Integer idMovimiento, LocalDateTime fecha, String tipo, String descripcion,
                     BigDecimal monto, Integer idCaja) {
            this.idMovimiento = idMovimiento;
            this.fecha = fecha;
            this.tipo = tipo;
            this.descripcion = descripcion;
            this.monto = monto;
            this.idCaja = idCaja;
        }
    }
}
