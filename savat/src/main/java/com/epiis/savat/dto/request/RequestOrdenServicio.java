package com.epiis.savat.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestOrdenServicio {

    private LocalDate fechaEntrega;
    private String descripcionProblema;
    private String estado; // RECIBIDO, DIAGNOSTICO, REPARACION, LISTO, ENTREGADO, CANCELADO

    @NotNull(message = "El cliente es requerido.")
    private Integer idCliente;

    @NotNull(message = "El usuario que registra la orden es requerido.")
    private Integer idUsuario;

    @NotNull(message = "El equipo es requerido.")
    private Integer idEquipo;
}
