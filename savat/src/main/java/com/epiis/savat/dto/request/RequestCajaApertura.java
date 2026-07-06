package com.epiis.savat.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestCajaApertura {

    @NotNull(message = "El monto inicial es requerido.")
    private BigDecimal montoInicial;
}
