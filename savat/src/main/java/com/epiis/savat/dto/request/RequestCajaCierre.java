package com.epiis.savat.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestCajaCierre {

    @NotNull(message = "El monto final es requerido.")
    private BigDecimal montoFinal;
}
