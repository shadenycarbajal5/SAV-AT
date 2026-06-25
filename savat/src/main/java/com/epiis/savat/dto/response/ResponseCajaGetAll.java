package com.epiis.savat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseCajaGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idCaja;
        public LocalDateTime fechaApertura;
        public LocalDateTime fechaCierre;
        public BigDecimal montoInicial;
        public BigDecimal montoFinal;
        public Boolean abierta;

        public Item(Integer idCaja, LocalDateTime fechaApertura, LocalDateTime fechaCierre,
                     BigDecimal montoInicial, BigDecimal montoFinal) {
            this.idCaja = idCaja;
            this.fechaApertura = fechaApertura;
            this.fechaCierre = fechaCierre;
            this.montoInicial = montoInicial;
            this.montoFinal = montoFinal;
            this.abierta = fechaCierre == null;
        }
    }
}