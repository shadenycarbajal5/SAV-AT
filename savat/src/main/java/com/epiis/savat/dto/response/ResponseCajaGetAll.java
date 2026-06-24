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
    }
}
