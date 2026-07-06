package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestProveedor {

    @NotBlank(message = "El nombre es requerido.")
    private String nombre;

    private String ruc;
    private String telefono;
    private String correo;
    private String direccion;
}
