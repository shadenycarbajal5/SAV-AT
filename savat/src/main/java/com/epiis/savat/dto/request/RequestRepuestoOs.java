package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestRepuestoOs {

    @NotNull(message = "La orden de servicio es requerida.")
    private Integer idOs;

    @NotNull(message = "El producto es requerido.")
    private Integer idProducto;

    @NotNull(message = "La cantidad es requerida.")
    private Integer cantidad;
}
