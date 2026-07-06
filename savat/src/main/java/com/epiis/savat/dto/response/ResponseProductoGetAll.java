package com.epiis.savat.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseProductoGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idProducto;
        public String nombre;
        public String descripcion;
        public BigDecimal precioVenta;
        public BigDecimal costo;
        public Integer stock;
        public Integer stockMinimo;
        public String codigoBarras;
        public String tipoProducto;
        public Boolean estado;
        public Integer idCategoriaProducto;
        public String categoriaProductoNombre;
        public Integer idProveedor;
        public String proveedorNombre;

        public Item(Integer idProducto, String nombre, String descripcion, BigDecimal precioVenta,
                     BigDecimal costo, Integer stock, Integer stockMinimo, String codigoBarras,
                     String tipoProducto, Boolean estado, Integer idCategoriaProducto,
                     String categoriaProductoNombre, Integer idProveedor, String proveedorNombre) {
            this.idProducto = idProducto;
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.precioVenta = precioVenta;
            this.costo = costo;
            this.stock = stock;
            this.stockMinimo = stockMinimo;
            this.codigoBarras = codigoBarras;
            this.tipoProducto = tipoProducto;
            this.estado = estado;
            this.idCategoriaProducto = idCategoriaProducto;
            this.categoriaProductoNombre = categoriaProductoNombre;
            this.idProveedor = idProveedor;
            this.proveedorNombre = proveedorNombre;
        }
    }
}
