package com.epiis.savat.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RequestClienteInsert {

    @NotBlank(message = "El nombre o razón social es obligatorio.")
    private String nombre;

    @NotBlank(message = "El número de documento (DNI/RUC) es obligatorio.")
    @Size(min = 8, max = 11, message = "El documento debe tener entre 8 y 11 dígitos.")
    private String numeroDocumento;

    private String telefono;

    @Email(message = "El formato del correo electrónico no es válido.")
    private String correo;

    private String direccion;
}