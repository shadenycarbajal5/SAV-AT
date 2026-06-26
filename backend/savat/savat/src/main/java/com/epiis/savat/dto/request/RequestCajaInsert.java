package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RequestCajaInsert {

    @NotBlank(message = "El nombre o código de la caja es obligatorio.")
    private String nombre;

    @NotNull(message = "El saldo de apertura no puede ser nulo.")
    @PositiveOrZero(message = "El monto de apertura debe ser mayor o igual a cero.")
    private BigDecimal montoApertura;

    @NotBlank(message = "Debe especificar la ubicación o sucursal de la caja.")
    private String ubicacion;
}