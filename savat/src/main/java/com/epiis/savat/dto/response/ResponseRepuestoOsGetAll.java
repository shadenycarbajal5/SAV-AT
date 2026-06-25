package com.epiis.savat.dto.response;

import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseRepuestoOsGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idRepuestoOs;
        public Integer idOs;
        public Integer idProducto;
        public String productoNombre;
        public Integer cantidad;

        public Item(Integer idRepuestoOs, Integer idOs, Integer idProducto, String productoNombre, Integer cantidad) {
            this.idRepuestoOs = idRepuestoOs;
            this.idOs = idOs;
            this.idProducto = idProducto;
            this.productoNombre = productoNombre;
            this.cantidad = cantidad;
        }
    }
}
