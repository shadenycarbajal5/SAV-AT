package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RequestUsuarioLogin {

    @NotBlank(message = "El nombre de usuario o correo electrónico es obligatorio.")
    private String username;

    @NotBlank(message = "La contraseña no puede estar vacía.")
    private String password;
}