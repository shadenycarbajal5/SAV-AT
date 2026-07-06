package com.epiis.savat.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestPromocion {

    @NotBlank(message = "El nombre es requerido.")
    private String nombre;

    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String tipoDescuento; // PORCENTAJE | MONTO_FIJO
    private BigDecimal valorDescuento;
    private Boolean estado;

    /** Ids de productos a los que aplica esta promoción. */
    private List<Integer> idsProducto;
}
