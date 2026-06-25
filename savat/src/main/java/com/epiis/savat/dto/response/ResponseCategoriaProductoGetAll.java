package com.epiis.savat.dto.response;

import java.util.List;

import com.epiis.savat.generic.ResponseGeneric;

public class ResponseCategoriaProductoGetAll extends ResponseGeneric {

    public List<Item> data;

    public static class Item {
        public Integer idCategoriaProducto;
        public String nombre;

        public Item(Integer idCategoriaProducto, String nombre) {
            this.idCategoriaProducto = idCategoriaProducto;
            this.nombre = nombre;
        }
    }
}
