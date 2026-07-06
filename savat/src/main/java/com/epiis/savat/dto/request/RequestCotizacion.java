package com.epiis.savat.dto.request;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestCotizacion {

    private LocalDate fechaVencimiento;

    @NotNull(message = "El cliente es requerido.")
    private Integer idCliente;

    @NotEmpty(message = "La cotización debe tener al menos un producto.")
    @Valid
    private List<DetalleItem> detalle;

    @Getter
    @Setter
    public static class DetalleItem {

        @NotNull(message = "El producto es requerido en cada detalle.")
        private Integer idProducto;

        @NotNull(message = "La cantidad es requerida en cada detalle.")
        private Integer cantidad;
    }
}
