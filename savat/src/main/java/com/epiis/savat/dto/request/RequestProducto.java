package com.epiis.savat.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestProducto {

    @NotBlank(message = "El nombre es requerido.")
    private String nombre;

    private String descripcion;
    private BigDecimal precioVenta;
    private BigDecimal costo;
    private Integer stock;
    private Integer stockMinimo;
    private String codigoBarras;
    private String tipoProducto; // "VENTA" | "REPUESTO"
    private Boolean estado;
    private Integer idCategoriaProducto;
    private Integer idProveedor;
}
