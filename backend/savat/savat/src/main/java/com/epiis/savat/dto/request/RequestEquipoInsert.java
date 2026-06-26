package com.epiis.savat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RequestEquipoInsert {

    @NotBlank(message = "La marca del equipo es obligatoria.")
    private String marca;

    @NotBlank(message = "El modelo del equipo es obligatorio.")
    private String modelo;

    @NotBlank(message = "El número de serie es obligatorio para el control de inventario.")
    private String numeroSerie;

    private String descripcion;

    @NotNull(message = "Debe asociar este equipo al ID de un cliente.")
    private Long clienteId; // Relación indispensable para saber de quién es el equipo
}