package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestCotizacionEstado {

    @NotBlank(message = "El estado es requerido.")
    private String estado; // PENDIENTE, APROBADA, RECHAZADA, CONVERTIDA
}
