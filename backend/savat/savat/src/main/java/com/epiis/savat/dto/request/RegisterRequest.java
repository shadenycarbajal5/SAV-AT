package com.epiis.savat.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(min = 4, max = 20, message = "El usuario debe tener entre 4 y 20 caracteres.")
    private String username;

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Debe proporcionar un formato de correo válido.")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    private String password;
    
    @NotBlank(message = "El rol es obligatorio.")
    private String role; // Ejemplo: "ADMIN", "USER", "CAJERO"
}