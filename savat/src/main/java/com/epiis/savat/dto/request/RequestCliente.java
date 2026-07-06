package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestCliente {

    @NotBlank(message = "El nombre es requerido.")
    private String nombres;

    private String dniRuc;
    private String telefono;
    private String correo;
    private String direccion;
    private Integer idCategoriaCliente;
}
