package com.epiis.savat.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestMovimientoCaja {

    @NotNull(message = "La caja es requerida.")
    private Integer idCaja;

    @NotBlank(message = "El tipo de movimiento es requerido.")
    private String tipo; // INGRESO | EGRESO

    private String descripcion;

    @NotNull(message = "El monto es requerido.")
    private BigDecimal monto;
}
