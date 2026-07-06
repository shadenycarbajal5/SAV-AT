package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestCategoriaCliente {

    @NotBlank(message = "El nombre es requerido.")
    private String nombre;
}
